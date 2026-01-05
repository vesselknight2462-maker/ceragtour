const SHEET_ID: string = "1BRLb-61FKy611Lfa2keiqibiDcLqub5ZUIW86FTsV2E";
const SHEET_NAME: string = "Sheet1";

const url: string = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

interface CellValue {
  v?: string;
}

interface Row {
  c: (CellValue | null)[];
}

interface GoogleSheetsResponse {
  table: {
    rows: Row[];
  };
}

fetch(url)
  .then((res: Response) => res.text())
  .then((text: string) => {
    const json: GoogleSheetsResponse = JSON.parse(text.substr(47).slice(0, -2));
    const rows: Row[] = json.table.rows;

    const gallery = document.getElementById("galleryContainer") as HTMLElement;

    rows.forEach((r: Row) => {
      const title: string = r.c[0]?.v || "";
      const desc: string = r.c[1]?.v || "";
      const img: string = r.c[2]?.v || "";

      gallery.innerHTML += `
        <div class="card">
          <img src="${img}" alt="${title}">
          <div class="card-content">
            <h3>${title}</h3>
            <p>${desc}</p>
          </div>
        </div>
      `;
    });
  })
  .catch((error: Error) => {
    console.error("Error loading gallery:", error);
  });
