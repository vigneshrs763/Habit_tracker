const defaultHabits = [

  {
    id: 1,
    name: "Solve 1 LeetCode problem",
    category: "Study",
    emoji: "💻",
    done: false,
    history: []
  },

  {
    id: 2,
    name: "Web development",
    category: "Study",
    emoji: "🚀",
    done: false,
    history: []
  },

  {
    id: 3,
    name: "Exercise",
    category: "Fitness",
    emoji: "🏃",
    done: false,
    history: []
  },

  {
    id: 4,
    name: "Read for 20 minutes",
    category: "Personal",
    emoji: "📚",
    done: false,
    history: []
  }

];


let habits =
  JSON.parse(
    localStorage.getItem("habitpulse-habits")
  ) || defaultHabits;


let app =
  JSON.parse(
    localStorage.getItem("habitpulse-app")
  ) || {

    streak: 0,
    best: 0,
    lastDate: null

  };


const $ = selector =>
  document.querySelector(selector);


const today =
  new Date()
    .toISOString()
    .slice(0, 10);


/* SAVE */

function save() {

  localStorage.setItem(
    "habitpulse-habits",
    JSON.stringify(habits)
  );

  localStorage.setItem(
    "habitpulse-app",
    JSON.stringify(app)
  );

}


/* DATE */

function dateText() {

  return new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


/* COMPLETED */

function completed() {

  return habits.filter(
    habit => habit.done
  ).length;

}


/* PROGRESS */

function progress() {

  if (!habits.length) {
    return 0;
  }

  return Math.round(
    completed() /
    habits.length *
    100
  );

}


/* RENDER */

function render() {

  $("#todayDate").textContent =
    dateText();


  $("#streak").textContent =
    app.streak +
    " day" +
    (app.streak === 1 ? "" : "s");


  $("#best").textContent =
    app.best +
    " day" +
    (app.best === 1 ? "" : "s");


  $("#progress").textContent =
    progress() + "%";


  $("#completed").textContent =
    completed() +
    " / " +
    habits.length;


  $("#habitList").innerHTML =
    habits.map(habitHTML).join("");


  $("#habitList2").innerHTML =
    habits.map(habitHTML).join("");


  bindHabitButtons();

  updateMessage();

  updateInsights();

}


/* HABIT HTML */

function habitHTML(habit) {

  return `

    <div class="habit ${habit.done ? "done" : ""}">

      <button
        class="check"
        data-id="${habit.id}"
        title="Mark complete"
      >
        ${habit.done ? "✓" : ""}
      </button>


      <div class="habit-icon">
        ${escapeHtml(habit.emoji || "🎯")}
      </div>


      <div class="habit-info">

        <b>
          ${escapeHtml(habit.name)}
        </b>

        <span>
          ${escapeHtml(habit.category)}
          ·
          ${habit.done
            ? "Completed today"
            : "Not completed yet"}
        </span>

      </div>


      <button
        class="delete"
        data-delete="${habit.id}"
        title="Delete"
      >
        ×
      </button>

    </div>

  `;

}


/* BUTTONS */

function bindHabitButtons() {

  document
    .querySelectorAll(".check")
    .forEach(button => {

      button.onclick = () =>
        toggleHabit(
          Number(button.dataset.id)
        );

    });


  document
    .querySelectorAll("[data-delete]")
    .forEach(button => {

      button.onclick = () =>
        deleteHabit(
          Number(button.dataset.delete)
        );

    });

}


/* TOGGLE HABIT */

function toggleHabit(id) {

  const habit =
    habits.find(
      item => item.id === id
    );


  if (!habit) {
    return;
  }


  habit.done =
    !habit.done;


  if (
    habit.done &&
    !habit.history.includes(today)
  ) {

    habit.history.push(today);

  }


  if (!habit.done) {

    habit.history =
      habit.history.filter(
        date => date !== today
      );

  }


  updateStreak();

  save();

  render();


  toast(
    habit.done
      ? "Habit completed ✓"
      : "Habit unchecked"
  );

}


/* STREAK */

function updateStreak() {

  if (
    completed() === habits.length &&
    habits.length
  ) {

    if (app.lastDate !== today) {

      app.streak =
        app.lastDate &&
        daysBetween(
          app.lastDate,
          today
        ) === 1

          ? app.streak + 1

          : 1;


      app.best =
        Math.max(
          app.best,
          app.streak
        );


      app.lastDate = today;

    }

  }

}


/* DAYS BETWEEN */

function daysBetween(a, b) {

  return Math.round(
    (
      new Date(b) -
      new Date(a)
    ) /
    86400000
  );

}


/* MOTIVATIONAL MESSAGE */

function updateMessage() {

  const done = completed();

  const total = habits.length;


  const message =
    $("#message");


  const sub =
    $("#messageSub");


  if (!total) {

    message.textContent =
      "Start your journey 🌱";

    sub.textContent =
      "Add a habit and make your first small commitment.";

    return;

  }


  if (done === total) {

    message.textContent =
      app.streak >= 7
        ? "🔥 You're on fire!"
        : "🎉 You crushed today!";


    sub.textContent =
      app.streak >= 7

        ? `${app.streak} days of consistency. Don't break the chain!`

        : "Every completed habit is a vote for the person you're becoming.";

    return;

  }


  if (done === 0) {

    message.textContent =
      "No pressure. Just start.";

    sub.textContent =
      "Complete one small habit. Momentum usually follows action.";

    return;

  }


  if (done / total >= 0.75) {

    message.textContent =
      "You're doing great! 💪";

    sub.textContent =
      `${total - done} more to go. Finish strong.`;

  }

  else {

    message.textContent =
      "Keep going 🌱";

    sub.textContent =
      `You've completed ${done} of ${total}. Do better next time, one step at a time.`;

  }

}


/* INSIGHTS */

function updateInsights() {

  const total =
    habits.reduce(
      (sum, habit) =>
        sum + habit.history.length,
      0
    );


  const weekly =
    habits.length

      ? Math.round(

          habits.reduce(
            (sum, habit) =>
              sum +
              Math.min(
                habit.history.length,
                7
              ),

            0
          )

          /

          (habits.length * 7)

          *

          100

        )

      : 0;


  $("#weekly").textContent =
    weekly + "%";


  $("#weeklyBar").style.width =
    weekly + "%";


  $("#totalDone").textContent =
    total;


  const best =
    habits
      .slice()
      .sort(
        (a, b) =>
          b.history.length -
          a.history.length
      )[0];


  $("#bestHabit").textContent =
    best
      ? best.name
      : "—";


  $("#bestHabitSub").textContent =
    best

      ? `${best.history.length} recorded completion${
          best.history.length === 1
            ? ""
            : "s"
        }.`

      : "Keep showing up.";

}


/* DELETE */

function deleteHabit(id) {

  habits =
    habits.filter(
      habit => habit.id !== id
    );


  save();

  render();

  toast("Habit removed");

}


/* MODAL */

function openModal() {

  $("#modal")
    .classList
    .remove("hidden");

}


function closeModal() {

  $("#modal")
    .classList
    .add("hidden");

}


$("#addBtn").onclick =
  openModal;


$("#addBtn2").onclick =
  openModal;


$("#closeBtn").onclick =
  closeModal;


$("#modal").onclick =
  event => {

    if (
      event.target.id === "modal"
    ) {

      closeModal();

    }

  };


/* ADD HABIT */

$("#habitForm").onsubmit =
  event => {

    event.preventDefault();


    const data =
      Object.fromEntries(
        new FormData(
          event.target
        )
      );


    habits.push({

      id: Date.now(),

      name: data.name,

      category: data.category,

      emoji:
        data.emoji || "🎯",

      done: false,

      history: []

    });


    save();

    render();

    event.target.reset();

    closeModal();

    toast(
      "New habit created ✓"
    );

  };


/* NAVIGATION */

document
  .querySelectorAll(".nav")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".nav")
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );


      button.classList.add(
        "active"
      );


      const page =
        button.dataset.page;


      $("#dashboardPage")
        .classList
        .toggle(
          "hidden",
          page !== "dashboard"
        );


      $("#habitsPage")
        .classList
        .toggle(
          "hidden",
          page !== "habits"
        );


      $("#insightsPage")
        .classList
        .toggle(
          "hidden",
          page !== "insights"
        );

    };

  });


/* DARK MODE */

$("#themeBtn").onclick =
  () => {

    document.body
      .classList
      .toggle("dark");


    localStorage.setItem(
      "habitpulse-theme",

      document.body.classList.contains(
        "dark"
      )
        ? "dark"
        : "light"
    );


    $("#themeBtn").textContent =
      document.body.classList.contains(
        "dark"
      )
        ? "☀"
        : "☾";

  };


if (
  localStorage.getItem(
    "habitpulse-theme"
  ) === "dark"
) {

  document.body
    .classList
    .add("dark");


  $("#themeBtn").textContent =
    "☀";

}


/* COMMANDS */

function runCommand(command) {

  command =
    command
      .trim()
      .toLowerCase();


  const done =
    completed();


  const total =
    habits.length;


  const percent =
    progress();


  let text = "";


  if (
    command === "/motivate"
  ) {

    if (percent === 100) {

      text =
        "🏆 You finished everything today. That's consistency in action. Keep going!";

    }

    else if (percent >= 50) {

      text =
        "💪 You're already halfway there. Finish what you started.";

    }

    else {

      text =
        "🌱 Don't wait for motivation. Start with one tiny action and let momentum do the rest.";

    }

  }


  else if (
    command === "/streak"
  ) {

    text =
      `🔥 Current streak: ${app.streak} day${
        app.streak === 1
          ? ""
          : "s"
      }. Best streak: ${app.best} day${
        app.best === 1
          ? ""
          : "s"
      }.`;

  }


  else if (
    command === "/stats"
  ) {

    const totalHistory =
      habits.reduce(
        (sum, habit) =>
          sum +
          habit.history.length,

        0
      );


    text =
      `📊 Today: ${done}/${total} completed (${percent}%). Total recorded completions: ${totalHistory}.`;

  }


  else if (
    command === "/today"
  ) {

    if (!total) {

      text =
        "📅 No habits yet. Add one to get started.";

    }

    else if (done === total) {

      text =
        "📅 Everything is complete! 🎉";

    }

    else {

      const remaining =
        total - done;


      text =
        `📅 ${remaining} habit${
          remaining === 1
            ? ""
            : "s"
        } still waiting for you.`;

    }

  }


  else if (
    command === "/quote"
  ) {

    const quotes = [

      "“Consistency is a superpower.”",

      "“One good day can restart a great routine.”",

      "“Small progress is still progress.”",

      "“You don't need a perfect day. Just make the next choice better.”"

    ];


    text =
      quotes[
        Math.floor(
          Math.random() *
          quotes.length
        )
      ];

  }


  else if (
    command === "/restart"
  ) {

    text =
      "🌱 Tomorrow is a fresh page. Forget the perfect streak—just show up again.";

  }


  else {

    text =
      "I know a few commands: /motivate, /streak, /stats, /today, /quote, /restart";

  }


  $("#commandResult").textContent =
    text;


  $("#commandResult")
    .classList
    .remove("hidden");

}


/* COMMAND BUTTON */

$("#commandBtn").onclick =
  () => {

    runCommand(
      $("#commandInput").value
    );

  };


/* ENTER KEY */

$("#commandInput").onkeydown =
  event => {

    if (
      event.key === "Enter"
    ) {

      runCommand(
        event.target.value
      );

    }

  };


/* QUICK COMMAND BUTTONS */

document
  .querySelectorAll(
    "[data-command]"
  )
  .forEach(button => {

    button.onclick = () => {

      const command =
        button.dataset.command;


      $("#commandInput").value =
        command;


      runCommand(command);

    };

  });


/* GREETING */

const hour =
  new Date().getHours();


$("#greeting").innerHTML =

  (
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening"
  )

  +

  ", Vignesh 👋";


/* ESCAPE HTML */

function escapeHtml(value = "") {

  return value.replace(
    /[&<>"']/g,

    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])

  );

}


/* TOAST */

function toast(message) {

  const toastElement =
    $("#toast");


  toastElement.textContent =
    message;


  toastElement.classList.add(
    "show"
  );


  setTimeout(
    () =>
      toastElement.classList.remove(
        "show"
      ),

    1800
  );

}


/* START */

render();
