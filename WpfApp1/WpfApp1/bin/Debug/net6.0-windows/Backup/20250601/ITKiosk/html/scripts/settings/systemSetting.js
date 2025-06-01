var kiosk = kiosk || {};
(function () {
    kiosk.enum = kiosk.enum || {};
    kiosk.enum.WorkType = {
        SendRequest: 1,
        PostRequest: 2,
        ResetDevice: 3,
        ResetConnection: 4
    };
    kiosk.enum.ScannerAction = {
        Close: 0,
        Open: 1,
        Reset: 3,
        ScanningBarCode: 4,
        ScanningBitMap: 5
    };
    kiosk.enum.ThermalAction = {
        Open: 1,
        Reset: 2,
        CutPaper: 3,
        Close: 4,
        PrintText: 5,
        PrintBitmap: 6,
        PrintBarCode: 7,
        PrintQRCode: 8,
        CheckNearEnd: 9,
        GetReviceStatus: 10,
        TransactionPrint: 11,
        Rotation: 12,
        PrintTemplatePage: 13
    };
    kiosk.enum.culture = {
        'ENUS': 1,
        'ZHTW': 2,
        'ZHCN': 3,
        'JAJP': 4,
        'KOKR': 5,
    };
    returnCulture = {
        1: "en",
        2: "zh_TW",
        3: "zh_CN",
        4: "jp",
        5: "ko",
    };
    kiosk.wording = {
        1: {
            help: "HELP",
            PrintPage: {
                main: 'Transaction Successfully and Enjoy Your Activity',
                thankyou: 'XXX thanks for your trans.'
            },
            swal: {
                checkInKeyin:''
            },
            errorCreditCard: '信用卡讀取有誤，請重新操作',
        },

        2: {
            help: "小幫手",
            PrintPage: {
                main: '交易成功，你可以參加本次活動',
                thankyou: 'XXX 感謝您的選購'
            },
            errorCreditCard: '信用卡讀取有誤，請重新操作',
        },

        3: {
            help: "小帮手",
            PrintPage: {
                main: '交易成功，你可以參加本次活動',
                thankyou: 'XXX 感謝您的選購'
            },
            errorCreditCard: '信用卡讀取有誤，請重新操作',
        },

        4: {
            help: "リトルヘルパー",
            PrintPage: {
                main: '交易成功，你可以參加本次活動',
                thankyou: 'XXX 感謝您的選購'
            },
            errorCreditCard: '信用卡讀取有誤，請重新操作',
        },

        5: {
            help: "작은 도우미",
            PrintPage: {
                main: '交易成功，你可以參加本次活動',
                thankyou: 'XXX 感謝您的選購'
            },
            errorCreditCard: '信用卡讀取有誤，請重新操作',
        },
    };

    kiosk.cultureMap = {
        'en-US': kiosk.enum.culture.ENUS,
        'zh-TW': kiosk.enum.culture.ZHTW,
        'ja-JP': kiosk.enum.culture.JAJP,
        'ko-KR': kiosk.enum.culture.KOKR,
        'zh-CN': kiosk.enum.culture.ZHCN,
        1: 'en-US',
        2: 'zh-TW',
        3: 'ja-rJP',
        4: 'ko-rKR',
        5: 'zh-rCN',
    };
    kiosk.cultureArry = [1, 2, 3, 4, 5];

    kiosk.secondMideaType = 'Video';
})();
