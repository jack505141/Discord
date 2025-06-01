// MainPage
Vue.component("component-MuseumID-main", {
  props: ["model"],
  template: "#template-MuseumID-main",
  data: function () {
    return {
      maskInput: true,
      currentCase: "uppercase",
      keyinValue: "",
      timer: undefined,
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
    goNext: function () {
      if (!this.verifyId(this.keyinValue)) {
        var sp_config = {
          spTitleText: viewModel[kiosk.culture]["MuseumID"].spTitleText,
          spContentTitle: viewModel[kiosk.culture]["MuseumID"].spContentTitle,
          // spContentText: '訂單編號 : PN1371330858<br>#123-12345678',
          // spBtnLeftText: '<img src="./img/Path5751.png" alt="">   ' + viewModel[kiosk.culture]['TVMcommon'].spBtnLeftText,
          // spBtnLeftFn: function () {},
          spBtnRightText:
            '<img src="./img/MaskGroup3.png" alt="">   ' +
            viewModel[kiosk.culture]["TVMcommon"].spBtnRightText,
          spBtnRightFn: function () {},
        };
        TVMSwal(sp_config);
      } else {
        setTimeout(function () {
          kiosk.API.goToNext(kiosk.status.sfSelectProductNext);
        }, 1000);
      }
    },
    goBack: function () {
      kiosk.API.goToNext("ProductChoice");
    },
    keyin: function (e) {
      if (e.target.className.indexOf("clear") != -1) {
        this.keyinValue = "";
      } else if (e.target.className.indexOf("delete") != -1) {
        if (this.keyinValue) {
          this.keyinValue = this.keyinValue.slice(0, -1);
        }
      } else {
        if (this.keyinValue.length < 10) {
          this.keyinValue = this.keyinValue + "" + e.target.innerHTML;
        }
      }
    },
    spaceKeyin: function (e) {
      if (this.keyinValue) this.keyinValue = this.keyinValue + " ";
    },
    scanKeyDown: function (event) {
      var vm = this;
      var e = event;
      if (kiosk.currentModelKey !== "MuseumID") {
        return;
      }
      // WriteLog(e.keyCode);
      switch (e.keyCode) {
        case 13:
          vm.goNext();
          break;
        default:
          if (
            (e.keyCode >= 48 && e.keyCode <= 57) ||
            (e.keyCode >= 65 && e.keyCode <= 90)
          ) {
            // vm.keyin += e.char
            vm.keyinValue += e.char;
          }
          break;
      }
    },
    verifyId: function (id) {
      id = id.trim();

      if (id.length != 10) {
        console.log("Fail，長度不正確");
        return false;
      }

      let countyCode = id.charCodeAt(0);
      if ((countyCode < 65) | (countyCode > 90)) {
        console.log("Fail，字首英文代號，縣市不正確");
        return false;
      }

      let genderCode = id.charCodeAt(1);
      if (genderCode != 49 && genderCode != 50) {
        console.log("Fail，性別代碼不正確");
        return false;
      }

      let serialCode = id.slice(2);
      for (let i in serialCode) {
        let c = serialCode.charCodeAt(i);
        if ((c < 48) | (c > 57)) {
          console.log("Fail，數字區出現非數字字元");
          return false;
        }
      }

      let conver = "ABCDEFGHJKLMNPQRSTUVXYWZIO";
      let weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

      id = String(conver.indexOf(id[0]) + 10) + id.slice(1);

      checkSum = 0;
      for (let i = 0; i < id.length; i++) {
        c = parseInt(id[i]);
        w = weights[i];
        checkSum += c * w;
      }

      verification = checkSum % 10 == 0;

      if (verification) {
        console.log("Pass");
      } else {
        console.log("Fail，檢核碼錯誤");
      }

      return verification;
    },
    switchMask: function () {
      this.maskInput = !this.maskInput;
    },
  },
  created: function () {
    kiosk.status.goBack = function () {
      kiosk.API.goToNext("mainMenu");
    };
  },
  mounted: function () {
    var vm = this;
    this.$nextTick(function () {
      function autofocus() {
        if (kiosk.currentModelKey === "MuseumID") {
          $("#scannerQuery").focus();
        }
      }
      autofocus();
      vm.timer = setInterval(autofocus, 3000);
      kiosk.app.updateLoading(false);
    });
  },
  beforeUpdate: function () {},
  updated: function () {
    var vm = this;
  },
  beforeDestroy: function () {
    if (this.timer != null) {
      clearTimeout(this.timer);
    }
  },
});

// NavBar
Vue.component("component-MuseumID-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: false,
      isShowHome: true,
    };
  },
});
