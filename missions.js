function challenge(kind, title, prompt, answer, hint, takeaway, extra = {}) {
  return { kind, title, prompt, answer, hint, takeaway, ...extra };
}

const missions = [
  {
    name: "Math", action: "Calculate fuel and plot a trajectory", planet: "Arcadia", theme: "#aabaff", color: "#829cff", icon: "∠",
    activities: [
      challenge("number", "Fuel the first burn", "Your tank holds 12 fuel units. The first burn uses 3/4 of a full tank. How many units will you use?", 9,
        "Divide 12 into four equal groups. Use three of those groups.", "Three groups of 3 make 9 fuel units.", { unit: "fuel units" }),
      challenge("number", "Check the fuel reserve", "You have 7.25 fuel units. The next two burns use 2.8 units and 1.65 units. How much fuel will be left?", 2.8,
        "Line up the decimal points. Add both burns first, then subtract the total from 7.25.", "The burns use 4.45 units. That leaves 2.8 units.", { unit: "fuel units" }),
      challenge("sort", "Rank the test burns", "Tap the fuel amounts from smallest to largest. Some are written as fractions and some as decimals.", [1, 3, 0, 2],
        "Write every amount in hundredths. For example, 3/4 equals 0.75.", "The order is 0.35, 0.50, 0.65, then 0.75.", { options: ["0.65", "0.35", "3/4", "1/2"] }),
      challenge("route", "Plot the course to Arcadia", "Arcadia is 9.375 map units away. Each segment covers 1.25 map units. Set the trajectory length in half-segment steps.", 7.5,
        "Seven segments cover 8.75 units. How much of one more segment covers the remaining 0.625?", "Seven and a half segments cover exactly 9.375 map units.", { max: 10 })
    ],
    final: [
      challenge("route", "Plot a course to Aurora", "Aurora is 13.5 map units away. Each segment covers 2.25 units. Set the number of segments.", 6,
        "Four segments cover 9 units. Two more cover 4.5 units.", "Your route covers all 13.5 map units.", { max: 10 }),
      challenge("route", "Plot a course to Cinder", "Cinder is 12.5 map units away. Each segment covers 1.25 units. Set the number of segments.", 10,
        "Two segments cover 2.5 units. How many pairs make 12.5 units?", "Ten segments cover all 12.5 map units.", { max: 12 })
    ]
  },
  {
    name: "Science", action: "Read sensor data and pack a lab", planet: "Frostora", theme: "#79efd5", color: "#5ee3ca", icon: "✳",
    activities: [
      challenge("match", "Build a planet scanner", "Match each question to the instrument that can answer it.", [2, 0, 1],
        "Temperature, wind speed, and images are different kinds of measurements.", "Each instrument collects a different kind of evidence.", {
          rows: ["How fast is the wind?", "How cold is the surface?", "What shape is the crater?"],
          options: ["Thermometer", "Camera", "Wind meter"]
        }),
      challenge("pick", "Predict the ice", "Select every Frostora sample that should be frozen. In the lab, the samples are pure water at Earth-like pressure and have reached the listed temperature.", [0, 3],
        "At these conditions, pure water freezes at 0 °C. Find both readings below zero.", "The ridge and shadowed valley have readings below freezing.", {
          options: ["Ridge · −12 °C", "Sunlit plain · 4 °C", "Inside the rover · 12 °C", "Shadowed valley · −3 °C"]
        }),
      challenge("sort", "Plan a fair test", "Find out whether Frostora dust makes ice melt faster. Put the experiment steps in order.", [2, 0, 3, 1],
        "Prepare matching samples first. Change only one thing. Observe before comparing.", "Changing only the dust makes the two samples easier to compare.", {
          options: ["Cover one sample with dust", "Compare the amount melted", "Set out two equal ice samples", "Wait 10 minutes in the same light"]
        }),
      challenge("pick", "Pack the Frostora lab", "The crew must take pictures and measure temperature. The kit can weigh at most 3 kg. Pack exactly two tools.", [1, 3],
        "Pick one camera and one thermometer. The heavy camera leaves only 0.4 kg.", "The two tools weigh 2.6 kg and collect both kinds of data.", { limit: 2, massLimit: 3, weights: [2.6, 1.8, .9, .8], options: ["Heavy camera · 2.6 kg", "Mini camera · 1.8 kg", "Wind meter · 0.9 kg", "Thermometer · 0.8 kg"] })
    ],
    final: [
      challenge("pick", "Choose the Aurora science kit", "Photograph Aurora’s clouds and measure wind speed. Choose two tools with a combined mass of at most 3 kg.", [1, 2],
        "The heavy camera and wind meter together go over 3 kg.", "Your kit can record pictures and wind speed.", { limit: 2, massLimit: 3, weights: [2.5, 1.6, .8, .7], options: ["Heavy camera · 2.5 kg", "Mini camera · 1.6 kg", "Wind meter · 0.8 kg", "Thermometer · 0.7 kg"] }),
      challenge("pick", "Choose the Cinder science kit", "Photograph Cinder’s rocks and measure surface temperature. Choose two tools with a combined mass of at most 3 kg.", [0, 3],
        "The heavy camera and thermometer together go over 3 kg.", "Your kit can record pictures and temperature.", { limit: 2, massLimit: 3, weights: [1.6, .8, 2.5, .7], options: ["Mini camera · 1.6 kg", "Wind meter · 0.8 kg", "Heavy camera · 2.5 kg", "Thermometer · 0.7 kg"] })
    ]
  },
  {
    name: "Reading & Writing", action: "Decode checklists and build a report", planet: "Signal Prime", theme: "#ffc887", color: "#ffad70", icon: "↗",
    activities: [
      challenge("sort", "Decode the checklist", "The flight note says to check the seal before closing the hatch. Log the result after closing it. Report to Earth after you log it.", [1, 2, 0, 3],
        "Follow the words before and after to find what has to happen first.", "You turned a flight note into an ordered checklist.", { options: ["Log the result", "Check the seal", "Close the hatch", "Report to Earth"] }),
      challenge("pick", "Find facts worth sending", "The log reads: “14:05. Left solar panel cracked. Battery at 82%. Crew thinks a rock might have hit it.” Send only details the crew confirmed.", [0, 2, 3],
        "Time, location, and measured status are observations. A guessed cause still needs proof.", "Your report gives Earth confirmed information.", { options: ["Found at 14:05", "A rock definitely hit it", "Left solar panel cracked", "Battery at 82%"] }),
      challenge("match", "Repair the radio message", "Match each part of a clear status message to the right line.", [2, 0, 1],
        "Think about what happened, where it happened, and what the crew will do next.", "A message with event, location, and action gives Earth a plan.", {
          rows: ["What happened?", "Where did it happen?", "What will the crew do?"],
          options: ["On the left solar panel.", "Inspect the crack after orbit.", "The panel cover cracked."]
        }),
      challenge("sort", "Transmit the launch report", "Build the message in this order: who’s calling, what happened, current risk, then next action.", [2, 0, 3, 1],
        "Start by naming your crew. Put the battery reading before the plan.", "Mission Control received a short, specific report.", { options: ["The left solar panel cover cracked.", "We’ll inspect it once in orbit.", "Signal Prime crew to Mission Control.", "Battery is at 82% and holding steady."] })
    ],
    final: [
      challenge("sort", "Send the final status report", "Mission Control asks for the affected part first, then the observed problem, the confirmed backup status, and the crew’s next action.", [1, 3, 2, 0],
        "Name the antenna first. Mention the backup before explaining what the crew will do.", "Mission Control received an unambiguous flight update.", { options: ["We’ll switch over before liftoff.", "Primary antenna update.", "The backup just passed its test.", "The primary signal is weak."] })
    ]
  },
  {
    name: "Art & Design", action: "Paint, label, and inspect a rocket", planet: "Prism", theme: "#e0b1ff", color: "#bc95f6", icon: "✦",
    activities: [
      challenge("swatch", "Paint a visible hatch", "Your rocket is dark navy. Pick a stripe that stands out in low light. Tap colors to preview them on the rocket.", 2,
        "Look for the biggest difference between light and dark.", "A bright yellow stripe is easy to see on a dark blue body.", {
          options: ["Dark purple", "Navy blue", "Bright yellow", "Dark teal"], colors: ["#4a2d69", "#19295f", "#ffdf61", "#12474d"], dark: true
        }),
      challenge("match", "Label the blueprint", "Tell the builders where to put each part. Match the location on the rocket to the part that belongs there.", [1, 2, 0],
        "The nose goes at the front, the crew looks out of the window, and thrust comes from the base.", "Accurate labels turn a drawing into instructions someone can build from.", {
          rows: ["Pointed top", "Center of the cabin", "Base beneath the body"],
          options: ["Engine nozzle", "Nose cone", "Crew window"]
        }),
      challenge("pick", "Create a readable rescue badge", "Pick exactly two changes that make the hatch badge easy to read from far away and easy to understand without color alone.", [1, 3],
        "Use size and a recognizable shape. A second color by itself won’t fix a tiny symbol.", "A large, clear shape gives the crew a second signal besides color.", {
          limit: 2, options: ["Make the symbol smaller", "Use one large, simple symbol", "Add several shades of purple", "Keep a clear outline around the symbol"]
        }),
      challenge("swatch", "Finish the Prism rocket", "The inspection team needs a stripe that shows up on the white rocket. Choose the darkest swatch and check the preview.", 1,
        "A dark mark has the clearest contrast on a light surface.", "Your navy marking is visible on the white rocket.", {
          options: ["White", "Deep navy", "Pale lavender", "Light gold"], colors: ["#fffaf0", "#18234a", "#ddd0ff", "#ffe0a0"]
        })
    ],
    final: [
      challenge("swatch", "Install the rescue marking", "The final rocket is white. Choose the clearest mark for a distance check, then preview it on the ship.", 3,
        "Choose a dark shape with a clear outline against the white body.", "The rescue marking passed the distance check.", {
          options: ["White", "Pale gray", "Light mint", "Deep plum"], colors: ["#fffaf0", "#d6d7e1", "#b7f4da", "#382057"]
        })
    ]
  },
  {
    name: "Engineering & Technology", action: "Assemble hardware and pass load tests", planet: "Bolt", theme: "#ffad9a", color: "#f68979", icon: "⚙",
    activities: [
      challenge("sort", "Assemble the sensor bay", "Mount the bracket before the sensor. Secure the sensor before plugging in its cable. Test the reading once it’s connected.", [2, 0, 3, 1],
        "Build the mount first. A disconnected sensor can’t show a reading.", "The sensor is secured and sending a reading.", { options: ["Secure the sensor", "Test the reading", "Mount the bracket", "Plug in the cable"] }),
      challenge("pick", "Build within the mass limit", "Pick a power source, a transmitter, and a mount. Your 4 kg payload limit includes every part.", [1, 2, 4],
        "The heavy battery and transmitter already total 4 kg, leaving no room for a mount.", "Your three parts weigh 3.5 kg and meet all three requirements.", {
          limit: 3, massLimit: 4, weights: [2.7, 1.5, 1.3, 1, .7], options: ["Heavy battery · 2.7 kg", "Compact battery · 1.5 kg", "Transmitter · 1.3 kg", "Test weight · 1 kg", "Mount · 0.7 kg"]
        }),
      challenge("match", "Read the diagnostics", "Match each warning to the check most likely to find its cause.", [1, 2, 0],
        "Voltage relates to power, signal drops relate to a connection, and movement relates to the mount.", "You chose a useful test for each symptom.", {
          rows: ["Low voltage", "Signal cuts out when the cable moves", "Sensor shakes during vibration test"],
          options: ["Check bracket fasteners", "Check the battery", "Inspect the cable connection"]
        }),
      challenge("pick", "Approve the flight hardware", "A mount passes when it moves 0.40 mm or less in both shake tests. Pick every mount that passes.", [1, 3],
        "Both readings must meet the limit. A reading exactly at 0.40 mm passes.", "Both selected mounts passed twice.", {
          options: ["Mount A · 0.28 mm / 0.42 mm", "Mount B · 0.40 mm / 0.36 mm", "Mount C · 0.41 mm / 0.39 mm", "Mount D · 0.32 mm / 0.34 mm"]
        })
    ],
    final: [
      challenge("pick", "Approve the launch mounts", "Select all mounts that pass both limits: movement at most 0.35 mm and mass at most 0.8 kg.", [0, 3],
        "Check both numbers. Being light doesn’t make up for too much movement.", "Both approved mounts meet the movement and mass limits.", {
          options: ["Mount A · 0.35 mm / 0.75 kg", "Mount B · 0.36 mm / 0.50 kg", "Mount C · 0.22 mm / 0.85 kg", "Mount D · 0.28 mm / 0.80 kg"]
        })
    ]
  },
  {
    name: "History & Teamwork", action: "Rebuild a timeline and assign the crew", planet: "Nova Haven", theme: "#8ee0ff", color: "#69c9ee", icon: "◈",
    activities: [
      challenge("sort", "Rebuild the space timeline", "Tap these real space milestones from earliest to latest.", [3, 1, 2, 0],
        "Sputnik is earliest. Apollo 8 orbited the Moon before Apollo 11 landed there.", "Satellites, lunar orbit, and a Moon landing were milestones reached by many teams.", {
          options: ["Apollo 11 lands on the Moon · July 1969", "Explorer 1 launches · January 1958", "Apollo 8 orbits the Moon · December 1968", "Sputnik 1 launches · October 1957"],
          sources: [["NASA’s early space timeline", "https://www.nasa.gov/history/dawn-of-the-space-age/"], ["NASA’s Apollo program overview", "https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-apollo-program/"]]
        }),
      challenge("pick", "Investigate the old flight log", "One practice flight missed a radio check. Another had two people change the same setting. Select exactly two rules that address these problems.", [0, 2],
        "Add a place to record the radio result, and give one person ownership of each setting.", "The crew used earlier mistakes to improve its own procedure.", {
          limit: 2, options: ["Record the radio check before launch", "Have everyone edit every setting", "Give each setting one named owner", "Skip readbacks to save time"]
        }),
      challenge("match", "Assign the crew", "Give each job to the person with the matching responsibility.", [2, 0, 1],
        "The flight director makes the final decision. The technician checks equipment. The communicator talks to Earth.", "Everyone has a role, and the flight director gets the results.", {
          rows: ["Make the go/no-go call", "Test the antenna connection", "Read the report to Mission Control"],
          options: ["Technician", "Communicator", "Flight director"]
        }),
      challenge("sort", "Run a crew readback", "Test the radio, report the result, get the flight director’s confirmation, then start the countdown.", [1, 3, 0, 2],
        "A readback only confirms a result that someone already reported.", "Your team caught the old checklist gap before starting the countdown.", {
          options: ["Director repeats the result", "Technician tests the radio", "Crew starts the countdown", "Technician reports the result"]
        })
    ],
    final: [
      challenge("match", "Staff the final flight console", "The previous crew missed a battery warning. Match three jobs so one person measures, a second checks the report, and the director decides when to launch.", [1, 2, 0],
        "Put the person who reads the hardware first and the decision-maker last.", "Your final crew has a check and a confirmation before liftoff.", {
          rows: ["Measure battery voltage", "Compare the reported reading with the flight limit", "Make the launch decision"],
          options: ["Flight director", "Electrical technician", "Independent checker"]
        })
    ]
  }
];

const destinations = [
  { name: "Aurora", color: "#c6a5f0", detail: "Bright clouds", distance: 13.5, correction: .75 },
  { name: "Cinder", color: "#ff9b7f", detail: "Dark, hot rock", distance: 12.5, correction: .35 }
];
