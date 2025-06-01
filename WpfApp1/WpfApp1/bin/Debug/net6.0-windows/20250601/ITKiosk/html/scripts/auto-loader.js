const jsFiles = [
  "scripts/components/component.deviceOpen.js",
  "scripts/components/component.adminVerify.js",
  "scripts/components/component.BillSetting.js",
  "scripts/components/component.ChooseSeat.js",
  "scripts/components/component.common.js",
  "scripts/components/component.ConfirmDetail.js",
  "scripts/components/component.Country.js",
  "scripts/components/component.deviceOpen.js",
  "scripts/components/component.mainMenu.js",
  "scripts/components/component.MuseumID.js",
  "scripts/components/component.Payment.js",
  "scripts/components/component.PaySuccess.js",
  "scripts/components/component.PrintFail.js",
  "scripts/components/component.ProductChoice.js",
  "scripts/components/component.ProductChoiceReserTicket.js",
  "scripts/components/component.ProductChoiceTicket.js",
  "scripts/components/component.ProductDescription.js",
  "scripts/components/component.register.js",
  "scripts/components/component.Unumber.js",
  "scripts/components/component.Vehicle.js",
];

jsFiles.forEach(function (src) {
  const script = document.createElement('script');
  script.src = src;
  script.type = 'text/javascript';
  script.defer = true;
  document.head.appendChild(script);
});
