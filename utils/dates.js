function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatDateWithTimezone(date) {
  const tzoffset = (date).getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1).split("T")[0];
}


function formatFlightDateShort(flightDate) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "numeric",
  }).format(flightDate);
}

function formatFlightDateLong(flightDate) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
   }).format(flightDate);
}

function formatMonth(date) {
  const formattedDate = formatDate(date);
  const dateSplit = formattedDate.split("-");
  return `${dateSplit[0]}-${dateSplit[1]}`;
}

let months = [];
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

for (let i = 0; i <= 12; i++) {
  const date = new Date(today);
  date.setMonth(date.getMonth() + i);
  months = [...months, {
    id: formatMonth(date),
    name: date.toLocaleString("es-AR", {
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      month: "long",
    }),
  }];
}

const minDate = today;
const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 361);

export {
  formatDate,
  formatDateWithTimezone,
  formatFlightDateLong,
  formatFlightDateShort,
  formatMonth,
  maxDate,
  minDate,
  months,
  today,
  tomorrow,
};