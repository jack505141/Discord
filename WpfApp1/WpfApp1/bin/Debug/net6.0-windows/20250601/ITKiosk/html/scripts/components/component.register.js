// MainPage
Vue.component("component-register-main", {
  props: ["model"],
  template: "#template-register-main",
  data: function () {
    return {
      checkDevice: kiosk.status.posCheckDevice,
    };
  },
  methods: {
    goNext: function (nextId, index) {
      kiosk.app.updateLoading(true);
      BackEnd.UpdateBasicData(kiosk.systemSetting.deviceCode)
        .then(function (res) {
          kiosk.API.goToNext("deviceOpen");
        })
        .catch(function (err) {
          alert(JSON.stringify(err));
        });
    },
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
  },
  created: function () {},
  mounted: function () {},
});
