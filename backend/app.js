const SHEET_ID = "1BRLb-61FKy611Lfa2keiqibiDcLqub5ZUIW86FTsV2E";
const SHEET_NAME = "Sheet1";

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const gallery = document.getElementById("galleryContainer");

    rows.forEach(r => {
      const title = r.c[0]?.v || "";
      const desc = r.c[1]?.v || "";
      const img = r.c[2]?.v || "";

      gallery.innerHTML += `
        <div class="card">
          <img src="${img}">
          <div class="card-content">
            <h3>${title}</h3>
            <p>${desc}</p>
          </div>
        </div>
      `;
    });
  });
