const missions = [
  {
    name: "Math", action: "Find the flight path", planet: "Arcadia", theme: "#2348b8", tint: "#dfe7ff", color: "#a6b9ff",
    lessons: [
      ["How far will we fly?", "A map can show a long trip in small spaces. If each space stands for 3 units, a trip of 2 spaces covers 6 units."],
      ["Give the rocket a route", "A rocket’s trajectory is the path it follows. Flight planners use math to work out where it will go. On our practice map, count how many spaces each route travels."]
    ],
    task: ["Plot a course to Arcadia", "Each map space is 3 units. Arcadia is 12 units away. Choose the number of spaces for your trajectory.", ["2 spaces", "4 spaces", "6 spaces"], 1, "Count by threes until you reach 12.", "Four groups of 3 make 12. You plotted a route to Arcadia."],
    final: [
      ["Set the flight distance", "Aurora is 15 units away. On this map, one space equals 3 units.", ["3 spaces", "4 spaces", "5 spaces"], 2, "Count by threes until you reach 15."],
      ["Set the flight distance", "Cinder is 18 units away. On this map, one space equals 3 units.", ["6 spaces", "5 spaces", "4 spaces"], 0, "Count by threes until you reach 18."]
    ]
  },
  {
    name: "Science", action: "Scout an icy world", planet: "Frostora", theme: "#14634a", tint: "#d9f0dd", color: "#7ed6a8",
    lessons: [
      ["Read the clues from a planet", "Scientists measure things like temperature to find out what a planet is like. Liquid water can freeze into ice when it gets cold enough."],
      ["Pick a tool for the job", "A camera can show what a surface looks like. A thermometer measures temperature. A mission can bring different tools for different questions."]
    ],
    task: ["Pack a tool for Frostora", "Your crew wants to measure how cold the surface is. What tool goes on the rocket?", ["Camera", "Compass", "Thermometer"], 2, "Look for the tool that measures temperature.", "The thermometer will help your crew measure Frostora’s temperature."],
    final: [
      ["Pack a science tool", "Your crew wants to take pictures of Aurora’s bright clouds.", ["Camera", "Thermometer", "Compass"], 0, "Which tool records pictures?"],
      ["Pack a science tool", "Your crew wants to check how hot Cinder’s dark rock is.", ["Camera", "Thermometer", "Compass"], 1, "Which tool measures temperature?"]
    ]
  },
  {
    name: "Reading & Writing", action: "Send a message from space", planet: "Signal Prime", theme: "#8b471a", tint: "#ffe9ca", color: "#ffbc73",
    lessons: [
      ["Read before you act", "Astronauts read checklists to find out what to do next. Words like first, next, and last tell you the order."],
      ["Write an update Earth can use", "A useful mission update tells readers what happened and where. Short, specific details help the crew on Earth act quickly."]
    ],
    task: ["Send the Signal Prime update", "Your crew found a crack in a solar panel. Which message gives Earth the clearest update?", ["“Something broke.”", "“The left solar panel has a crack.”", "“Please send help!”"], 1, "Say exactly what is damaged and where it is.", "Earth knows which panel needs attention. Your message is ready to send."],
    final: [["Confirm the status message", "The hatch is closed. Pick the clearest update to read back to Mission Control.", ["“The hatch is closed.”", "“That part is fine.”", "“Something shut.”"], 0, "Choose the message that names the part and its status."]]
  },
  {
    name: "Art & Design", action: "Design a rocket people can read", planet: "Prism", theme: "#693b9f", tint: "#eee1fb", color: "#c6a5f0",
    lessons: [
      ["Sketch the idea", "A labeled sketch shows what parts go where before anyone builds. Designers can try new shapes and colors quickly on paper."],
      ["Help the crew spot important parts", "Contrast is a big difference between colors or shades. A bright mark on a dark surface is easier to see than a dark mark on the same surface."]
    ],
    task: ["Design a stripe for Prism", "Your rocket has a dark blue body. Pick the hatch stripe the crew can see most easily.", ["Dark purple", "Navy blue", "Bright yellow"], 2, "Choose a stripe much lighter than the rocket body.", "The bright yellow stripe makes the hatch easy to spot."],
    final: [["Design a visible rescue badge", "The rocket’s rescue badge sits on a white panel. Pick a symbol with the strongest contrast.", ["White symbol", "Dark navy symbol", "Pale gray symbol"], 1, "A dark symbol stands out against a light panel."]]
  },
  {
    name: "Engineering & Technology", action: "Build and test your rocket", planet: "Bolt", theme: "#a43d2c", tint: "#ffe2da", color: "#ff9b7f",
    lessons: [
      ["Build from the plan", "Engineers use drawings to build and fit parts together. Sensors help them check what is happening inside and outside the rocket."],
      ["Test, improve, and test again", "A test can show what needs to change. If a part is loose, fix it and repeat the test so you can see whether the fix worked."]
    ],
    task: ["Get the rocket ready for Bolt", "A practice shake test shows that the sensor bracket is loose. Pick the next step.", ["Secure the bracket and repeat the shake test.", "Hide the sensor reading.", "Launch with the loose bracket."], 0, "Repair the problem and check the repair with another test.", "The bracket passed its second test. The sensor is ready for flight."],
    final: [["Clear the hardware test", "A practice test shows the battery mount moving. Pick the plan that makes the rocket ready.", ["Skip the test.", "Fasten the mount and retest it.", "Paint the mount."], 1, "Fix the loose part and test it again."]]
  },
  {
    name: "History & Teamwork", action: "Learn from earlier flights", planet: "Nova Haven", theme: "#185e72", tint: "#d9eff4", color: "#7dc8da",
    lessons: [
      ["Learn from earlier missions", "Flight crews keep records about what went well and what went wrong. A new crew can check a flight log before planning its own launch."],
      ["Give everyone a job", "One person can read the checklist while another checks the rocket. Hearing both people report back helps the whole team know what is ready."]
    ],
    task: ["Make a checklist for Nova Haven", "The last crew forgot to check the radio. How can your team learn from that flight?", ["Erase the old log.", "Have one teammate do every job.", "Add a radio check and have a teammate confirm it."], 2, "Use the old log to add a step and give someone a clear job.", "Your crew used the old flight log to make its launch checklist better."],
    final: [["Run the crew check", "The last crew missed a battery warning. Pick an update for this crew’s checklist.", ["Assign a teammate to check the battery and report back.", "Ignore the flight log.", "Let everyone guess the battery level."], 0, "Use what the last crew learned and give someone a clear job."]]
  }
];

const destinations = [
  { name: "Aurora", color: "#c6a5f0", detail: "A planet with bright clouds", distance: 15 },
  { name: "Cinder", color: "#ff9b7f", detail: "A planet with dark, hot rock", distance: 18 }
];
