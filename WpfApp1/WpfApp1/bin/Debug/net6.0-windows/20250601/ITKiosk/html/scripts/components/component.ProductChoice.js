// MainPage
Vue.component("component-ProductChoice-main", {
  props: ["model"],
  template: "#template-ProductChoice-main",
    data: function () {
        
        var posSaleProductListCategory = (kiosk.posSaleProductListCategory && kiosk.posSaleProductListCategory[0] && kiosk.posSaleProductListCategory[0].CategoryList) || [];
        var productListForView = (kiosk.posSaleProductListCategory && kiosk.posSaleProductListCategory[0] && kiosk.posSaleProductListCategory[0].CategoryProductList) || [];
       
       
        var result = {
            //posSaleProductListCategory: [
            //  {
            //    categoryId: "",
            //    name: "ALL",
            //    showOrder: 0,
            //  },
            //],
            posSaleProductListCategory: posSaleProductListCategory,
            productListForView: productListForView,
            defaultCategory: "ALL",
            limitMuseumID: [
                "SP1185312313",
                "SP6466231619",
                "SP3656176960", // useFakeData 台南十鼓仁糖文創園區門票(非預約信託)
                "SP5668577241", // useFakeData 8K海洋劇場
                "SP5726775813", // 單日核銷x無限制x國籍驗證x當日有效
                // "SP5971133191", // 單次核銷x無庫存限制
            ],
        };       
        return result;
  },
  methods: {
    goHome: function () {
      kiosk.API.initStatus();
      kiosk.API.goToNext("mainMenu");
    },
    // goNext: function () {
    //   kiosk.API.goToNext('ProductChoiceTicket')
    // },
    goBack: function () {
      kiosk.API.goToNext("mainMenu");
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper != undefined) {
        vm.swiper.update();
      } else {
        vm.swiper = new Swiper(".swiper-posMainMenu", {
          direction: "vertical",
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          grid: {
            fill: "row",
            rows: 3,
          },
          scrollbar: {
            el: ".swiper-scrollbar",
          },
          mousewheel: true,
          on: {
            // click: function (e) {
            //   var clickEvent = document.createEvent('MouseEvents');
            //   clickEvent.initEvent('mousedown', true, true);
            //   e.target.dispatchEvent(clickEvent);
            // },
            tap: function (e) {
              var clickEvent = document.createEvent("MouseEvents");
              clickEvent.initEvent("mousedown", true, true);
              e.target.dispatchEvent(clickEvent);
            },
          },
        });
      }
      if (vm.swiper3 != undefined) {
        vm.swiper3.update();
      } else {
        vm.swiper3 = new Swiper(".swiper-sessionItemSp", {
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          pagination: {
            el: ".swiper-pagination",
          },
          // scrollbar: {
          //   el: '.swiper-scrollbar',
          // },
          mousewheel: true,
        });
      }
    },
    posChooseProduct: function (item) {
        var vm = this;
      //debugger
      if (item.isSoldOut) {
        showAlert({
          title: vm.model.SoldOut,
          type: "info",
          confirm: "確認",
          confirmFn: function () {
            // 待補
          },
        });
        return;
        }
      
      // debugger
        kiosk.status.posSaleProductList = JSON.parse(
            JSON.stringify(kiosk.posSaleProductListCategory[0].ReplicaRes)
        );
     
      // vm.$forceUpdate();
      // return;
      // 暫存點選 - 商品類型
      // alert(item.saleCode);
      kiosk.status.sfSelectProductId = item.saleProductId;
      if (this.limitMuseumID.indexOf(item.saleCode) !== -1) {
        if (item.productType == "RESERVATION") {
          kiosk.status.sfSelectProductNext = "ProductChoiceReserTicket";
        } else {
          kiosk.status.sfSelectProductNext = "ProductChoiceTicket";
        }

        kiosk.app.updateLoading(true);
        setTimeout(function () {
          kiosk.API.goToNext("MuseumID");
          kiosk.app.updateLoading(false);
        }, 700);
      } else {
        if (item.productType == "RESERVATION") {
          kiosk.API.goToNext("ProductChoiceReserTicket");
        } else {
          kiosk.API.goToNext("ProductChoiceTicket");
        }
      }
    },
    changeCategory: function (category) {
        var vm = this;
        
        if (vm.defaultCategory == category.name) {
            return;
        };
        kiosk.app.updateLoading(true);
        var isCategoryExists = kiosk.posSaleProductListCategory.some(function (item) {
            return item.name === category.name;
        });
        if (isCategoryExists) {

            var existingCategory = kiosk.posSaleProductListCategory.find(function (item) {
                return item.name === category.name;
            });

            vm.defaultCategory = category.name;
            vm.productListForView = existingCategory.CategoryProductList;
         
            vm.$forceUpdate();
            return;
        } 
      PalaceAPI.posSaleProductList(category)
        .then(function (res) {
          kiosk.app.updateLoading(false);
          vm.defaultCategory = category.name;
          vm.productListForView = JSON.parse(
            JSON.stringify(res.saleProductList)
            );
            kiosk.posSaleProductListCategory.push({
                name: category.name,
                CategoryProductList: res.saleProductList
            });
          //var LengthOfSPList =
          //  kiosk.status.posSaleProductList.saleProductList.length;
          //for (i = 0; i < LengthOfSPList; i++) {
          //  var item = kiosk.status.posSaleProductList.saleProductList[i];
          //  item.productNum = 0;
          //  item.productAmt = 0;
          //  // console.log(item);
          //  // product.push(item);
          //  if (item.productType === "TICKET") {
          //    item.ticketData.saleProductSpecList.map(function (ticketItem) {
          //      ticketItem.quantity = 0;
          //    });
          //  }
          //}
          vm.checkIfAnyProdSoldOut();
          vm.$forceUpdate();
        })
        .catch(function (errMsg) {
          kiosk.app.updateLoading(false);
          var sp_config = {
            spTitleText: errMsg.includes("#1040-")
              ? vm.model.NoAvailableProductTitle
              : vm.model.NetworkErrTtitle,
            spContentTitle: errMsg.includes("#1040-")
              ? vm.model.NoAvailableProduct
              : vm.model.NetworkErr,
            spBtnLeftText:
              '<img src="./img/Path5751.png" alt="">   ' +
              vm.model.NetworkErrLeft,
            spBtnLeftFn: function () {
              vm.goHome();
            },
            spBtnRightText:
              '<img src="./img/MaskGroup3.png" alt="">   ' +
              vm.model.NetworkErrRight,
            spBtnRightFn: function () {},
          };
          TVMSwal(sp_config);
        });
    },
    checkIfAnyProdSoldOut: function () {
      var vm = this;
      if (vm.productListForView) {
        for (var index = 0; index < vm.productListForView.length; index++) {
          var item = vm.productListForView[index];
          switch (item.inventoryMode) {
            case "BY_PRODUCT":
              item.status === "SOLDOUT" || item.inventory === 0
                ? (item.isSoldOut = true)
                : (item.isSoldOut = false);
              break;

            case "BY_SPEC":
              var SOLDOUT = true;
              for (i = 0; i < item.ticketData.saleProductSpecList.length; i++) {
                if (item.ticketData.saleProductSpecList[i].inventory > 0) {
                  SOLDOUT = false;
                }
              }
              SOLDOUT ? (item.isSoldOut = true) : (item.isSoldOut = false);
              break;

            case "UNLIMITED":
              item.isSoldOut = false;
              break;

            default:
              item.isSoldOut = false;
              break;
          }
        }
      }
    },
  },
  created: function () {
    kiosk.status.goBack = function () {
      kiosk.API.goToNext("mainMenu");
      };
      //kiosk.posSaleProductListCategory = kiosk.posSaleProductListCategory || [];
      
  },
  mounted: function () {
    var vm = this;
    kiosk.status.currentBookingSpecId = null;
    kiosk.status.isSeatReservation = null;
    kiosk.status.seatAllocatedMode = null;
      //debugger;
    // 購票完成點擊繼續購買後，先檢查機器狀態
    if (kiosk.lastModelKey === "PaySuccess") {
      checkCashBox();
    }
     
      this.$nextTick(function () {
          if (vm.productListForView && vm.productListForView.length > 0) {
              vm.initSwiper();
              return;
          }


        kiosk.app.updateLoading(true);
        
        if (kiosk.status.posSaleProductList == null && !kiosk.posSaleProductListCategory[0] ) {
        console.log("Get New Sale Product List");
        PalaceAPI.posSaleProductList()
          .then(function (res) {
            console.log("OK");
            // alert(JSON.stringify(res));
            // kiosk.app.updateLoading(false);
            // posSaleProductList 銷售總表單
            //  kiosk.status.posSaleProductList =res;
            ////vm.productListForView = JSON.parse(
            ////  JSON.stringify(res.saleProductList)
            ////  );
            //  kiosk.posSaleProductListCategory.push({
            //      name: "ALL",
            //      CategoryProductList: res.saleProductList,
            //      CategoryList: res.categoryList,
            //      ReplicaRes:res
            //  });
            //  vm.productListForView = kiosk.posSaleProductListCategory[0].ReplicaRes.saleProductList;
            // var product = [];
                kiosk.posSaleProductListCategory.push({
                  name: "ALL",
                  CategoryProductList: res.saleProductList,
                    CategoryList: [{
                        categoryId: "",
                        name: "ALL",
                        showOrder: 0,
                    }],
                  ReplicaRes:res
                });
              /*kiosk.status.posSaleProductList = JSON.parse(JSON.stringify(kiosk.posSaleProductListCategory[0].ReplicaRes));*/
              vm.productListForView = kiosk.posSaleProductListCategory[0].CategoryProductList;
            var LengthOfSPList =
                kiosk.posSaleProductListCategory[0].ReplicaRes.saleProductList.length;
            for (i = 0; i < LengthOfSPList; i++) {
                var item = kiosk.posSaleProductListCategory[0].ReplicaRes.saleProductList[i];
              item.productNum = 0;
              item.productAmt = 0;
              
              if (item.productType === "TICKET") {
                item.ticketData.saleProductSpecList.map(function (ticketItem) {
                  ticketItem.quantity = 0;
                });
              }
            }
            //kiosk.status.posSaleProductListCategory =
            //      vm.posSaleProductListCategory.concat(res.categoryList);
             
              res.categoryList.map(function (Item) {
                  kiosk.posSaleProductListCategory[0].CategoryList.push(Item)
              });
              vm.posSaleProductListCategory = kiosk.posSaleProductListCategory[0].CategoryList;
            //vm.posSaleProductListCategory =
            //  kiosk.status.posSaleProductListCategory;
            // vm.product = product;
            // kiosk.app.updateLoading(false);
            // alert('1:' + kiosk.app.isLoading)
            // vm.$forceUpdate();
            vm.checkIfAnyProdSoldOut();
            kiosk.app.updateLoading(false);
            vm.$forceUpdate();
          })
          .catch(function (errMsg) {
            kiosk.app.updateLoading(false);
            var sp_config = {
              spTitleText: errMsg.includes("#1040-")
                ? vm.model.NoAvailableProductTitle
                : vm.model.NetworkErrTtitle,
              spContentTitle: errMsg.includes("#1040-")
                ? vm.model.NoAvailableProduct
                : vm.model.NetworkErr,
              spBtnLeftText:
                '<img src="./img/Path5751.png" alt="">   ' +
                vm.model.NetworkErrLeft,
              spBtnLeftFn: function () {
                vm.goHome();
              },
              spBtnRightText:
                '<img src="./img/MaskGroup3.png" alt="">   ' +
                vm.model.NetworkErrRight,
              spBtnRightFn: function () {},
            };
            TVMSwal(sp_config);
          });
      } else {
            console.log("Get Catch Sale Product List");
          
            

        vm.productListForView = kiosk.posSaleProductListCategory[0].CategoryProductList;
           
        vm.posSaleProductListCategory = kiosk.posSaleProductListCategory[0].CategoryList;
        //vm.checkIfAnyProdSoldOut();
        kiosk.app.updateLoading(false);
        //vm.$forceUpdate();
      }
    });
  },
  beforeUpdate: function () {
    kiosk.app.updateLoading(true);
    // alert('2:' + kiosk.app.isLoading)
  },
  updated: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.initSwiper();
      // alert('3:' + kiosk.app.isLoading)
      kiosk.app.updateLoading(false);
    });
  },
});

// NavBar
Vue.component("component-ProductChoice-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: false,
      isShowHome: true,
    };
  },
});
