const functions = require('firebase-functions')
const divinationList = require("./data.json");

// Import the appropriate service and chosen wrappers
const {
    dialogflow,
    Image,
    List,
    BasicCard,
    Button,
    Suggestions,
} = require('actions-on-google')

const MENU_LIST = {
    'DIVINATION': 'DIVINATION',
    'EXPLAIN_DIVINATION': 'EXPLAIN_DIVINATION',
    'SHOW_MAP': 'SHOW_MAP',
    'DISCLAIMER': 'DISCLAIMER'
};

// Create an app instance
const app = dialogflow()

// Intent in Dialogflow called `Default Welcome Intent`
app.intent('Default Welcome Intent', conv => {
    conv.ask('車公靈籤 ' + "");
    menu(conv);
})

// Intent in Dialogflow called `actions_intent_OPTION-handler`
app.intent('actions_intent_OPTION-handler', (conv, params, option) => {

    switch (option) {
        case MENU_LIST.DIVINATION:
            handleDivination(conv);
            break;
        case MENU_LIST.DISCLAIMER:
            handleDisclaimer(conv);
            break;
        case MENU_LIST.EXPLAIN_DIVINATION:
            handleExplainDivination(conv);
            break;
        case MENU_LIST.SHOW_MAP:
            handleShowMap(conv);
            break;
        default:
            menu(conv);
            break;
    }

    conv.ask(new Suggestions(['選單', '再見']));
});

// Intent in Dialogflow called  `Menu`
app.intent('Menu', conv => {
    conv.ask(`請選擇服務`)
    menu(conv);
})

// Intent in Dialogflow called `RetrieveDivination`
app.intent('RetrieveDivination', (conv, params) => {
    const divinationNumber = params.divinationNumber;

    let obj = getData(divinationNumber);
    if (obj == null) {
        conv.ask(`沒有第${divinationNumber}籤號`)
        menu(conv);
        return;
    }
    displayDivination(conv, obj);
    conv.ask(new Suggestions(['21', '40', '22', '選單', '再見']));
})

// Intent in Dialogflow called `Goodbye`
app.intent('Goodbye', conv => {
    conv.close('再見')
})

// Intent in Dialogflow called `Default Fallback Intent`
app.intent('Default Fallback Intent', conv => {
    conv.ask(`可以再說明一點好嗎?`)
    menu(conv);
})

exports.fulfillment = functions.https.onRequest(app)

function handleDivination(conv) {

    let obj = null;
    do {
        let randomInt = getRandomIntInclusive(1, 96);
        console.log("Random index : " + randomInt);
        obj = getData(randomInt);
    } while (obj == null)

    displayDivination(conv, obj);
}

function displayDivination(conv, obj) {
    let lines = (obj.result1 + obj.result2 + obj.result3 + obj.result4);
    lines = lines.replace("自身：", "\n自身：").trim();
    lines = lines.replace("財運：", "\n財運：").trim();
    lines = lines.replace("訴訟：", "\n訴訟：").trim();
    lines = lines.replace("行人：", "\n行人：").trim();
    lines = lines.replace("生育：", "\n生育：").trim();
    lines = lines.replace("出行：", "\n出行：").trim();
    lines = lines.replace("事業：", "\n事業：").trim();
    lines = lines.replace("姻緣：", "\n姻緣：").trim();
    lines = lines.replace("家宅：", "\n家宅：").trim();
    lines = lines.replace("疾病：", "\n疾病：").trim();
    lines = lines.replace("搬遷：", "\n搬遷：").trim();
    lines = lines.replace("\n\n", "\n");

    let response1 = `${obj.token} ${obj.score}  <break time=\"1\" />`;
    let response2 = `${obj.line1} \n${obj.line2}\n`
    let response3 = lines;

    conv.ask(`<speak>${response1}</speak>`);
    conv.ask(`${response2}${response3}`);
}

function handleExplainDivination(conv) {
    conv.ask(`你抽到的靈籤號碼是?`);
    conv.ask(new Suggestions(['1', '10', '22']));
}

function handleDisclaimer(conv) {
    conv.ask(`此軟件建議的求簽和查解簽文功能只作參考, 內容及程序都可能有所不足, 惟彼等並不擔保這軟件產生的資料之準確性及可靠性, 且概不會就因有關資料之任何不確或遺漏而引致之任何損失或損害承擔任何責任。大眾亦應明白玄學命理並非精密科學, 命運總要靠自己掌握。`)
    menu(conv);
}

function handleShowMap(conv) {
    conv.ask('前往方法');
    // Create a basic card
    conv.ask(new BasicCard({
        subtitle: '沙田車公廟路7號',
        text: `從港鐵車公廟站B出口依路牌指示，步行約10分鐘前往。`,
        title: '地址',
        buttons: new Button({
            title: '開啓',
            url: `https://goo.gl/maps/oSHSrtMoyj82`,
        }),
        image: new Image({
            url: 'https://raw.githubusercontent.com/normankong/CKOnline/master/images/map.png',
            alt: '地圖',
        }),
        display: 'CROPPED',
    }));
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function getData(randomInt) {
    return divinationList.data[randomInt - 1];
}

function menu(conv) {

    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
        conv.ask('此設備暫時不支援');
        return;
    }
    // Create a list
    conv.ask(new List({
        title: '請選擇服務',
        items: {
            // Add the first item to the list
            'DIVINATION': {
                synonyms: [],
                title: '求籤',
                description: `默念自己姓名、出生時辰及要指引的事情`,
                image: new Image({
                    url: 'https://raw.githubusercontent.com/normankong/CKOnline/master/images/temple.jpg',
                    alt: '求籤',
                }),
            },
            'EXPLAIN_DIVINATION': {
                synonyms: [],
                title: '解籤',
                description: `已有籤在手, 求解說`,
                image: new Image({
                    url: 'https://raw.githubusercontent.com/normankong/CKOnline/master/images/divination.jpg',
                    alt: '解籤',
                }),
            },
            // Show Map
            'SHOW_MAP': {
                synonyms: [],
                title: '地圖',
                description: '地址 : 沙田車公廟路7號',
                image: new Image({
                    url: 'https://raw.githubusercontent.com/normankong/CKOnline/master/images/map.png',
                    alt: '地址',
                }),
            }, // Disclaimer
            'DISCLAIMER': {
                synonyms: [],
                title: '免責聲明',
                description: '此軟件建議的求簽和查解簽文功能只作參考',
                image: new Image({
                    url: 'https://raw.githubusercontent.com/normankong/CKOnline/master/images/disclaimer.jpg',
                    alt: '免責聲明',
                }),
            },
        },
    }));
}