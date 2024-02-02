import * as cheerio from "cheerio";

type Session = {
  session: string;
  semester: number;
};

export default function getSessions(content: string): {
  currentSession: Session;
  sessions: Session[];
} {
  const $ = cheerio.load(content);

  const temp = $("h3.box-title").text().trim().replace(",", "").split(" ");
  const currentSession: Session = {
    session: temp.at(-1) || "",
    semester: parseInt(temp.at(-2) || "0"),
  };
  const sessions: Session[] = $("ul.dropdown-menu > li > a")
    .map((i, el) => ({
      // Original string: Sem X, 20XX/20XX

      // Get session: 20XX/20XX
      session: $(el).text().split(", ")[1],

      // Get semester: X
      semester: parseInt($(el).text().split(", ")[0].split(" ")[1]),
    }))
    .get()
    .reverse();

  return { currentSession, sessions };
}
