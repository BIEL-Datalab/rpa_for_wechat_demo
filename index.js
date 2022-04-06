const wdio = require("webdriverio");
const sleep = require("sleepjs");

const ERROR = {
    PHONE_ERROR: new Error("phone num error"),
    PHONE_NO_FOUND: new Error("phone no found"),
    ADD_FAIL: new Error("add contact error"),
    ADD_TO_OFTEN: new Error("add too often"),
};

const PHONE = "18888888888";

const opts = {
    port: 4723,
    path: "/wd/hub",
    capabilities: {
        "platformName": "Android",
        "appium:platformVersion": "6.0.1",
        "appium:deviceName": "MuMu",
        "appium:appPackage": "com.tencent.wework",
        "appium:appActivity": "com.tencent.wework.launch.LaunchSplashActivity",
        "appium:noReset": true,
    }
};

async function Tap(client, xpath, x, y) {
    screen = await client.$(xpath);
    await screen.touchAction({
        action: "tap",
        x,
        y
    });
}

async function WaitForElement(client, selectStr, options) {
    const ele = await client.$(selectStr);
    await ele.waitForDisplayed({
        timeout: options["timeout"],
        interval: options["interval"],
    });
    return ele;
}

async function main() {
    const client = await wdio.remote(opts);
    console.log("查找加号元素>>>>>>>>>>>>>");
    await WaitForElement(
        client,
        "//hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.RelativeLayout/android.widget.FrameLayout[2]/android.widget.RelativeLayout/android.widget.RelativeLayout/android.widget.LinearLayout[3]/android.widget.RelativeLayout[2]/android.widget.TextView",
        {
            timeout: 30000,
            interval: 2000,
        },
    );
    console.log("查找加号元素存在>>>>>>>>>>>>>>>");
    await Tap(client, "//hierarchy/android.widget.FrameLayout", 380, 50);
    await WaitForElement(
        client,
        "//hierarchy/android.widget.FrameLayout/android.widget.RelativeLayout/android.widget.RelativeLayout/android.widget.ScrollView/android.widget.ListView/android.widget.RelativeLayout[2]",
        {
            timeout: 30000,
            interval: 2000
        }
    );
    console.log("添加客户区域出现>>>>>>>>>>>>>>>>>");
    await Tap(client, "//hierarchy/android.widget.FrameLayout/android.widget.RelativeLayout/android.widget.RelativeLayout", 74, 83);
    await WaitForElement(
        client,
        "//hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.RelativeLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.ScrollView/android.widget.LinearLayout/android.widget.LinearLayout[1]/android.widget.FrameLayout[2]/android.widget.RelativeLayout/android.widget.RelativeLayout/android.widget.LinearLayout",
        {
            timeout: 30000,
            interval: 2000
        }
    );
    console.log("搜索手机号添加区域出现>>>>>>>>>>>>>>>>>>>");
    await Tap(client, "//hierarchy/android.widget.FrameLayout", 167, 178);
    const editArea = await WaitForElement(
        client,
        "//hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.RelativeLayout/android.widget.RelativeLayout/android.widget.RelativeLayout/android.widget.EditText",
        {
            timeout: 30000,
            interval: 2000
        }
    );
    await editArea.setValue(PHONE);
    try {
        await WaitForElement(
            client,
            "//hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.RelativeLayout/androidx.recyclerview.widget.RecyclerView/android.widget.RelativeLayout/android.widget.RelativeLayout",
            {
                timeout: 10000,
                interval: 1000
            }
        );
    } catch (e) {
        throw ERROR.PHONE_ERROR;
    }
    await Tap(client, "//hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout", 210, 100);
    let isPhoneFound = true;
    try {
        await WaitForElement(
            client,
            "id=com.tencent.wework:id/cfg",
            {
                timeout: 6000,
                interval: 2000
            }
        );
        isPhoneFound = false;
    } catch (e) {}
    if (!isPhoneFound) throw ERROR.PHONE_NO_FOUND;
    console.log("存在");
    const contactArea = await WaitForElement(
        client,
        "id=com.tencent.wework:id/cqr",
        {
            timeout: 6000,
            interval: 1000,
        }
    );
    await contactArea.click();
    await sleep.sleep(2000);
    const addBtn = await WaitForElement(
        client,
        "id=com.tencent.wework:id/jq",
        {
            timeout: 6000,
            interval: 1000,
        }
    );
    await addBtn.click();
    await sleep.sleep(2000);
    const inviteBtn = await WaitForElement(
        client,
        "id=com.tencent.wework:id/e2z",
        {
            timeout: 6000,
            interval: 1000,
        }
    );
    await inviteBtn.click();

    // 是否邀约成功判定
    let isPass = true;
    try {
        const alertModal = await WaitForElement(
            client,
            "id=com.tencent.wework:id/cfm",
            {
                timeout: 6000,
                interval: 1000,
            }
        );
        const alertCtx = await alertModal.getText();
        console.log(alertCtx);
        isPass = false;
    } catch (e) {}
    if (!isPass) throw ERROR.ADD_TO_OFTEN;
    try {
        await WaitForElement(
            client,
            "id=com.tencent.wework:id/jq",
            {
                timeout: 6000,
                interval: 1000,
            }
        );
    } catch (e) {
        throw ERROR.ADD_FAIL;
    }
    console.log("成功！");
    await sleep.sleep(5000);
    await client.deleteSession();
}

main();
