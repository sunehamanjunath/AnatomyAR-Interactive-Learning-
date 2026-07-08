/* ============================================================
   AnatomyAR - single source of truth for all organ content.
   Used by every page: gallery, study pages, AR scanner, quiz, assistant.
   ============================================================ */
window.ORGANS = [
  {
    id: "heart",
    name: "Heart",
    system: "Circulatory System",
    color: "#e63946",
    emoji: "🫀",
    marker: 0,
    model: "models/heart.glb",
    tagline: "The pump that never rests.",
    overview:
      "The heart is a muscular organ about the size of your fist, sitting just left of the centre of your chest. " +
      "It beats around 100,000 times a day, pushing blood through roughly 100,000 km of vessels to deliver oxygen and nutrients to every cell.",
    facts: [
      { label: "Chambers", text: "Four - two atria on top, two ventricles below." },
      { label: "Rate", text: "Beats about 60-100 times per minute at rest." },
      { label: "Output", text: "Pumps roughly 5 litres of blood every minute." },
      { label: "Power", text: "The left ventricle is the strongest chamber - it pushes blood to the whole body." }
    ],
    parts: [
      { name: "Right atrium", text: "Receives oxygen-poor blood returning from the body." },
      { name: "Right ventricle", text: "Pumps that blood to the lungs to pick up oxygen." },
      { name: "Left atrium", text: "Receives oxygen-rich blood coming back from the lungs." },
      { name: "Left ventricle", text: "Pumps oxygen-rich blood out to the entire body." },
      { name: "Aorta", text: "The body's largest artery - the main highway out of the heart." },
      { name: "Valves", text: "Four one-way valves keep blood flowing in the right direction." }
    ],
    funFact: "Your heart creates enough pressure to squirt blood up to 9 metres.",
    quiz: [
      { q: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], answer: 2 },
      { q: "Which chamber pumps blood to the whole body?", options: ["Right atrium", "Left ventricle", "Right ventricle", "Left atrium"], answer: 1 },
      { q: "What is the largest artery leaving the heart?", options: ["Vena cava", "Pulmonary vein", "Aorta", "Capillary"], answer: 2 }
    ]
  },
  {
    id: "brain",
    name: "Brain",
    system: "Nervous System",
    color: "#9b5de5",
    emoji: "🧠",
    marker: 1,
    model: "models/brain.glb",
    tagline: "The body's control centre.",
    overview:
      "The brain is the command centre of the nervous system. Weighing about 1.4 kg, it holds roughly 86 billion neurons " +
      "that control thought, memory, emotion, movement and every one of your senses.",
    facts: [
      { label: "Neurons", text: "About 86 billion, each connecting to thousands of others." },
      { label: "Energy", text: "Uses around 20% of the body's oxygen and energy." },
      { label: "Speed", text: "Nerve signals can travel faster than 400 km/h." },
      { label: "Halves", text: "Two hemispheres, each controlling the opposite side of the body." }
    ],
    parts: [
      { name: "Cerebrum", text: "The large wrinkled part - thinking, senses and voluntary movement." },
      { name: "Cerebellum", text: "Sits at the back - balance, coordination and fine movement." },
      { name: "Brainstem", text: "Connects to the spinal cord - controls breathing and heartbeat." },
      { name: "Frontal lobe", text: "Decision-making, personality and planning." },
      { name: "Occipital lobe", text: "Processes what you see." }
    ],
    funFact: "The brain generates enough electricity to power a small LED light.",
    quiz: [
      { q: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Brainstem", "Frontal lobe"], answer: 1 },
      { q: "Roughly how many neurons are in the human brain?", options: ["86 thousand", "86 million", "86 billion", "86 trillion"], answer: 2 },
      { q: "The brainstem helps control which vital function?", options: ["Seeing colour", "Breathing", "Tasting food", "Growing hair"], answer: 1 }
    ]
  },
  {
    id: "lungs",
    name: "Lungs",
    system: "Respiratory System",
    color: "#00bbf9",
    emoji: "🫁",
    marker: 2,
    model: "models/lungs.glb",
    tagline: "Where blood meets air.",
    overview:
      "The lungs are a pair of spongy organs that bring oxygen into the body and push carbon dioxide out. " +
      "Inside them are hundreds of millions of tiny air sacs called alveoli where this exchange happens with every breath.",
    facts: [
      { label: "Alveoli", text: "300-500 million air sacs - spread flat they'd cover a tennis court." },
      { label: "Lobes", text: "Right lung has 3 lobes, the left has 2 (room for the heart)." },
      { label: "Breaths", text: "You breathe about 20,000 times a day." },
      { label: "Job", text: "Swap oxygen into the blood and carbon dioxide out." }
    ],
    parts: [
      { name: "Trachea", text: "The windpipe that carries air down from the throat." },
      { name: "Bronchi", text: "Two large branches, one into each lung." },
      { name: "Bronchioles", text: "Smaller and smaller branching airways." },
      { name: "Alveoli", text: "Tiny sacs where oxygen and carbon dioxide are exchanged." },
      { name: "Diaphragm", text: "The muscle below the lungs that drives breathing." }
    ],
    funFact: "If you opened out all the airways in your lungs, they would stretch about 2,400 km.",
    quiz: [
      { q: "Where does gas exchange happen in the lungs?", options: ["Trachea", "Bronchi", "Alveoli", "Diaphragm"], answer: 2 },
      { q: "How many lobes does the right lung have?", options: ["1", "2", "3", "4"], answer: 2 },
      { q: "Which muscle powers breathing?", options: ["Biceps", "Diaphragm", "Heart", "Tongue"], answer: 1 }
    ]
  },
  {
    id: "kidney",
    name: "Kidney",
    system: "Urinary System",
    color: "#f4a261",
    emoji: "🫘",
    marker: 3,
    model: "models/kidney.glb",
    tagline: "The body's filtration plant.",
    overview:
      "The kidneys are two bean-shaped organs that clean the blood. Every day they filter about 180 litres of blood, " +
      "removing waste and extra water as urine while keeping salts and water in balance.",
    facts: [
      { label: "Nephrons", text: "Each kidney holds about 1 million tiny filters called nephrons." },
      { label: "Filtering", text: "Together they filter all your blood roughly 40 times a day." },
      { label: "Balance", text: "They control water, salt and blood pressure." },
      { label: "Backup", text: "You can live a healthy life with just one kidney." }
    ],
    parts: [
      { name: "Cortex", text: "The outer layer where filtering begins." },
      { name: "Medulla", text: "The inner region that concentrates urine." },
      { name: "Nephron", text: "The microscopic filtering unit - the kidney's workhorse." },
      { name: "Renal pelvis", text: "Funnels urine toward the ureter." },
      { name: "Ureter", text: "The tube carrying urine to the bladder." }
    ],
    funFact: "Your kidneys filter your entire blood supply about every 30 minutes.",
    quiz: [
      { q: "What is the tiny filtering unit of the kidney called?", options: ["Neuron", "Nephron", "Alveolus", "Villus"], answer: 1 },
      { q: "What shape are the kidneys usually described as?", options: ["Heart-shaped", "Bean-shaped", "Star-shaped", "Round"], answer: 1 },
      { q: "Which tube carries urine from the kidney to the bladder?", options: ["Urethra", "Ureter", "Aorta", "Trachea"], answer: 1 }
    ]
  },
  {
    id: "pelvis",
    name: "Pelvis",
    system: "Skeletal System",
    color: "#adb5bd",
    emoji: "🦴",
    marker: 4,
    model: "models/pelvis.glb",
    tagline: "The body's strong foundation.",
    overview:
      "The pelvis is a sturdy ring of bone at the base of the spine. It carries the weight of the upper body, " +
      "connects the spine to the legs, and protects the bladder and lower digestive organs.",
    facts: [
      { label: "Support", text: "Transfers the body's weight from the spine to the legs." },
      { label: "Protection", text: "Shields the bladder, intestines and reproductive organs." },
      { label: "Made of", text: "Two hip bones plus the sacrum and coccyx." },
      { label: "Difference", text: "The female pelvis is wider, shaped for childbirth." }
    ],
    parts: [
      { name: "Ilium", text: "The large flaring upper part of the hip bone." },
      { name: "Ischium", text: "The lower-back part you sit on." },
      { name: "Pubis", text: "The front part where the two hip bones meet." },
      { name: "Sacrum", text: "The triangular bone joining the pelvis to the spine." },
      { name: "Acetabulum", text: "The socket where the thigh bone fits - the hip joint." }
    ],
    funFact: "The pelvis is one of the strongest parts of the skeleton, able to bear several times your body weight.",
    quiz: [
      { q: "Which part of the hip bone do you sit on?", options: ["Ilium", "Ischium", "Pubis", "Sacrum"], answer: 1 },
      { q: "The socket where the thigh bone fits is the…", options: ["Acetabulum", "Sacrum", "Cortex", "Atrium"], answer: 0 },
      { q: "Which bone joins the pelvis to the spine?", options: ["Pubis", "Ilium", "Sacrum", "Ischium"], answer: 2 }
    ]
  },
  {
    id: "liver",
    name: "Liver",
    system: "Digestive System",
    color: "#bc4749",
    emoji: "🟤",
    marker: 5,
    model: "models/liver.glb",
    tagline: "The body's chemical factory.",
    overview:
      "The liver is the largest internal organ and performs over 500 jobs. It processes nutrients from food, " +
      "filters toxins from the blood, makes bile to digest fats, and stores energy and vitamins.",
    facts: [
      { label: "Size", text: "The largest internal organ, weighing about 1.5 kg." },
      { label: "Jobs", text: "Carries out more than 500 different functions." },
      { label: "Bile", text: "Produces bile that helps digest fatty foods." },
      { label: "Regrows", text: "The only human organ that can regrow lost tissue." }
    ],
    parts: [
      { name: "Right lobe", text: "The larger of the two main lobes." },
      { name: "Left lobe", text: "The smaller main lobe." },
      { name: "Hepatic artery", text: "Brings oxygen-rich blood to the liver." },
      { name: "Portal vein", text: "Brings nutrient-rich blood from the intestines." },
      { name: "Bile ducts", text: "Carry bile to the gallbladder and intestine." }
    ],
    funFact: "Even if up to 70% of the liver is removed, it can grow back to full size.",
    quiz: [
      { q: "What does the liver produce to help digest fats?", options: ["Insulin", "Bile", "Saliva", "Adrenaline"], answer: 1 },
      { q: "Which organ is the only one that can regrow itself?", options: ["Heart", "Liver", "Brain", "Kidney"], answer: 1 },
      { q: "The liver is the largest ____ organ in the body.", options: ["external", "internal", "muscular", "sensory"], answer: 1 }
    ]
  }
];

window.getOrgan = function (id) {
  return window.ORGANS.filter(function (o) { return o.id === id; })[0] || null;
};
