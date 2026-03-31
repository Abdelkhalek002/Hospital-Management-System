import fs from "fs/promises";

export const renderHTML = async (path, data) => {
  let content = await fs.readFile(path, "utf-8");

  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, data[key]);
  }

  return content;
};
