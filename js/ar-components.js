/* Reusable A-Frame components for the marker-based AR scanner. */

/* auto-fit: after a glTF model loads, centre it and scale it to a fixed size so
   any organ model (which can be tiny or huge) sits nicely on the marker. */
AFRAME.registerComponent("auto-fit", {
  schema: { size: { default: 1 } },
  init: function () {
    var el = this.el;
    var size = this.data.size;
    el.addEventListener("model-loaded", function () {
      var box = new THREE.Box3().setFromObject(el.object3D);
      var dims = new THREE.Vector3();
      var center = new THREE.Vector3();
      box.getSize(dims);
      box.getCenter(center);
      var maxDim = Math.max(dims.x, dims.y, dims.z) || 1;
      var s = size / maxDim;
      el.object3D.scale.set(s, s, s);
      // Centre on X/Z, and rest the bottom of the model on the marker (y = 0).
      el.object3D.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    });
  }
});

/* lazy-load: only download an organ's .glb the first time its marker is seen.
   Keeps the initial page load fast even with several large models. */
AFRAME.registerComponent("lazy-load", {
  schema: { src: { type: "string" } },
  init: function () {
    var el = this.el;
    var src = this.data.src;
    var loaded = false;
    el.addEventListener("markerFound", function () {
      if (!loaded) {
        loaded = true;
        var model = el.querySelector("[data-model]");
        if (model) model.setAttribute("gltf-model", src);
      }
    });
  }
});

/* status: shows a rich info card (name, system, fact) when a marker is found. */
AFRAME.registerComponent("status", {
  schema: { oid: { type: "string" } },
  init: function () {
    var el = this.el;
    var organ = (window.getOrgan && window.getOrgan(this.data.oid)) || null;
    var card = document.getElementById("info");
    var hint = document.getElementById("hint");
    el.addEventListener("markerFound", function () {
      if (hint) hint.style.display = "none";
      if (card && organ) {
        card.style.display = "block";
        card.style.borderColor = organ.color;
        card.innerHTML =
          '<div class="i-top"><span class="i-emoji">' + organ.emoji + '</span>' +
          '<div><div class="i-name">' + organ.name + '</div>' +
          '<div class="i-sys" style="color:' + organ.color + '">' + organ.system + '</div></div></div>' +
          '<div class="i-fact">' + organ.facts[0].text + '</div>' +
          '<a class="i-link" href="organ.html?id=' + organ.id + '">Open full 3D study →</a>';
      }
    });
    el.addEventListener("markerLost", function () {
      if (card) card.style.display = "none";
      if (hint) hint.style.display = "block";
    });
  }
});

/* ---- Touch gestures: pinch to zoom, one-finger drag to rotate ----
   Compact version of the well-known AR.js gesture-detector / gesture-handler pair. */
AFRAME.registerComponent("gesture-detector", {
  schema: { element: { default: "" } },
  init: function () {
    this.targetElement = this.data.element ? document.querySelector(this.data.element) : this.el;
    if (!this.targetElement) this.targetElement = this.el;
    this.internalState = { previousState: null };
    this.emitGestureEvent = this.emitGestureEvent.bind(this);
    this.targetElement.addEventListener("touchstart", this.emitGestureEvent);
    this.targetElement.addEventListener("touchend", this.emitGestureEvent);
    this.targetElement.addEventListener("touchmove", this.emitGestureEvent);
  },
  remove: function () {
    this.targetElement.removeEventListener("touchstart", this.emitGestureEvent);
    this.targetElement.removeEventListener("touchend", this.emitGestureEvent);
    this.targetElement.removeEventListener("touchmove", this.emitGestureEvent);
  },
  emitGestureEvent: function (event) {
    var currentState = this.getTouchState(event);
    var previousState = this.internalState.previousState;
    var gestureContinues = previousState && currentState &&
      currentState.touchCount === previousState.touchCount;
    var gestureEnded = previousState && !gestureContinues;
    var gestureStarted = currentState && !gestureContinues;

    if (gestureEnded) {
      var endEvent = previousState.touchCount + "fingerend";
      this.el.emit(endEvent, previousState);
      this.internalState.previousState = null;
    }
    if (gestureStarted) {
      currentState.startTime = performance.now();
      currentState.startPosition = currentState.position;
      currentState.startSpread = currentState.spread;
      var startEvent = currentState.touchCount + "fingerstart";
      this.el.emit(startEvent, currentState);
      this.internalState.previousState = currentState;
    }
    if (gestureContinues) {
      var eventDetail = {
        positionChange: {
          x: currentState.position.x - previousState.position.x,
          y: currentState.position.y - previousState.position.y
        }
      };
      if (currentState.spread) {
        eventDetail.spreadChange = currentState.spread - previousState.spread;
      }
      Object.assign(previousState, currentState);
      Object.assign(eventDetail, previousState);
      var moveEvent = currentState.touchCount + "fingermove";
      this.el.emit(moveEvent, eventDetail);
    }
  },
  getTouchState: function (event) {
    if (event.touches.length === 0) return null;
    var touchList = [];
    for (var i = 0; i < event.touches.length; i++) touchList.push(event.touches[i]);
    var touchState = { touchCount: touchList.length };
    var x = touchList.reduce(function (s, t) { return s + t.clientX; }, 0) / touchList.length;
    var y = touchList.reduce(function (s, t) { return s + t.clientY; }, 0) / touchList.length;
    touchState.position = { x: x, y: y };
    if (touchList.length >= 2) {
      var dx = touchList[0].clientX - touchList[1].clientX;
      var dy = touchList[0].clientY - touchList[1].clientY;
      touchState.spread = Math.sqrt(dx * dx + dy * dy);
    }
    return touchState;
  }
});

AFRAME.registerComponent("gesture-handler", {
  schema: {
    enabled: { default: true },
    rotationFactor: { default: 5 },
    minScale: { default: 0.3 },
    maxScale: { default: 8 }
  },
  init: function () {
    this.handleScale = this.handleScale.bind(this);
    this.handleRotation = this.handleRotation.bind(this);
    this.isVisible = false;
    this.initialScale = this.el.object3D.scale.clone();
    this.scaleFactor = 1;
    this.el.sceneEl.addEventListener("markerFound", function () { this.isVisible = true; }.bind(this));
    this.el.sceneEl.addEventListener("markerLost", function () { this.isVisible = false; }.bind(this));
  },
  play: function () {
    this.el.sceneEl.addEventListener("onefingermove", this.handleRotation);
    this.el.sceneEl.addEventListener("twofingermove", this.handleScale);
  },
  pause: function () {
    this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
    this.el.sceneEl.removeEventListener("twofingermove", this.handleScale);
  },
  handleRotation: function (event) {
    if (!this.isVisible) return;
    this.el.object3D.rotation.y += event.detail.positionChange.x * this.data.rotationFactor / 100;
    this.el.object3D.rotation.x += event.detail.positionChange.y * this.data.rotationFactor / 100;
  },
  handleScale: function (event) {
    if (!this.isVisible) return;
    this.scaleFactor *= 1 + event.detail.spreadChange / window.innerWidth;
    this.scaleFactor = Math.min(Math.max(this.scaleFactor, this.data.minScale), this.data.maxScale);
    this.el.object3D.scale.x = this.scaleFactor * this.initialScale.x;
    this.el.object3D.scale.y = this.scaleFactor * this.initialScale.y;
    this.el.object3D.scale.z = this.scaleFactor * this.initialScale.z;
  }
});
