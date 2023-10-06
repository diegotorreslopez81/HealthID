import apiService from "./apiService.js";
import { AMOUNT_TO_STORE } from "../Constants.js";

export const isValidURL = (str: string) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
};

export const addNewContent = (urlData: any) => {
  const { url, title, image, amount, domain, conditionType, condition } = urlData;
  if (!url) throw new Error("You need to enter a URL");
  if (!isValidURL(url)) throw new Error("Invalid URL");

  return apiService.put("/publisher/premiumContent", {
    url,
    title,
    image,
    amount: AMOUNT_TO_STORE(amount),
    domain,
    conditionType,
    condition
  });
};

export const previewNewUrl = (url: string) => {
  if (!url) throw new Error("You need to enter a URL");
  if (!isValidURL(url)) throw new Error("Invalid URL");

  return apiService.get(`/publisher/previewUrl?url=${url}`);
};

export const changeStatusContent = (content: any) =>
  apiService.put(`/publisher/premiumContentStatus?url=${content.url}`);

export const deleteContent = (content: any) => {
  return apiService.delete(`/publisher/premiumContent?url=${content.url}`);
};
