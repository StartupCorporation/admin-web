const digits = "\\d";
const optionalCountryCode = "(\\+38|\\*38|38|\\+380)?";
const optionalZero = "(0)?";
const separators = "[\\s-]*";

const r = (re, flags = "u") =>
  new RegExp(
    re
      .replace(/#[^\n]*/gm, "")
      .replace(/\\#/gm, "#")
      .replace(/\s/gm, ""),
    flags,
  );

const re = r(
  String.raw`
  ^
  (?<fullNumber>
      ${optionalCountryCode}
      ${optionalZero}
      \(*
      ${separators}
      (?<areaCode>${digits}{2,3})
      ${separators}
      \)*
      ${separators}
      (?<firstPart>${digits}{3})
      ${separators}
      -?
      (?<secondPart>${digits}{2})
      ${separators}
      -?
      (?<thirdPart>${digits}{2})
  )
  $
  `,
);

const parser = (number) => {
  const cleanedNumber = number.replace(/[^+\d]/g, "");
  return cleanedNumber.match(re) ? re.exec(cleanedNumber).groups : { number };
};

const numberFormatter = (number) => {
  const { fullNumber, areaCode, firstPart, secondPart, thirdPart } = number;

  const formattedNumber = `+380 (${areaCode}) ${firstPart}‒${secondPart}‒${thirdPart}`;

  return fullNumber ? formattedNumber : number.number;
};

export const phoneNumber = (phone) => numberFormatter(parser(phone));
