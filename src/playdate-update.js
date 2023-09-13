var urlParams = new URLSearchParams(window.location.search);

fetch('/playdate.json')
  .then((response) => response.json())
  .then((json) => {
    let version = urlParams.get("v");
    let app = urlParams.get("a");
    let latestVersion = json[app]["version"];
    let result = version.localeCompare(latestVersion, undefined, { numeric: true, sensitivity: 'base' });
    if (result == 1 || result == 0) {
      let e = document.getElementById("msg");
      e.innerText = "You have the latest version of ";
      let a = document.createElement("a");
      a.innerText = json[app]["name"];
      a.href = json[app]["link"];
      e.appendChild(a);
    } else {
      let e = document.getElementById("msg");
      e.innerText = "There is an update available for ";
      let a = document.createElement("a");
      a.innerText = json[app]["name"];
      a.href = json[app]["link"];
      e.appendChild(a);
      e.appendChild(document.createElement("br"));
      let a2 = document.createElement("a");
      a2.innerText = "Download version " + json[app].version;
      a2.href = json[app]["version-link"];
      e.appendChild(a2);
    }
  });