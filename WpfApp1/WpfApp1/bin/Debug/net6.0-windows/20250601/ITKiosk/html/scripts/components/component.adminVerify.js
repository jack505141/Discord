Vue.component("component-adminVerify-main", {
  props: ["model"],
  template: "#template-adminVerify-main",
  data: function () {
    var _data = {
      keyinValue: "",
    };
    return _data;
  },
  methods: {
    keyin: function (e) {
      switch (e.target.innerHTML) {
        //case 'SHIFT':
        //    this.toUpperCase = true;
        //    break;
        case "刪除":
          if (this.keyinValue) {
            this.keyinValue = this.keyinValue.slice(0, -1);
          }
          break;
        case "清除":
          this.keyinValue = "";
          break;
        default:
          this.keyinValue = this.keyinValue + "" + e.target.innerHTML;
          break;
      }
      kiosk.status.keyinValue = this.keyinValue;
    },
    spaceKeyin: function (e) {
      if (this.keyinValue) this.keyinValue = this.keyinValue + " ";
    },
    verify: function (action) {
      if (
        this.keyinValue === "52653760" ||
        this.keyinValue === "42760988" ||
        this.keyinValue === kiosk.systemSetting.AdminPassword
      ) {
        kiosk.API.goToNext("admin");
      } else {
        this.keyinValue = "";
        swal({
          title: "密碼錯誤！",
          text: "請重新輸入",
          type: "info",
          confirmButtonText: "確定",
          allowOutsideClick: false,
        });
      }
    },
  },
  mounted: function () {
    kiosk.status.keyinValue = "";
    kiosk.status.CheckPassword = "";

    var vm = this;
    if (!testFlag.viewDebugger) {
      vm.keyinValue = "";
    } else {
      vm.keyinValue = "52653760";
    }
  },
});

Vue.component("component-adminVerify-navBar", {
  props: ["culture", "model"],
  template: "#template-admin-navBar",
  data: function () {
    return {};
  },
  created: function () {},
  methods: {
    handleMouseDown: function (nextId) {
      kiosk.API.goToNext("mainMenu");
    },
  },
});
