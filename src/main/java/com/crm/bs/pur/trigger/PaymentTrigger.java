package com.crm.bs.pur.trigger;

import com.crm.api.BaseResponse;
import com.crm.api.Configuration;
import com.crm.api.NetWorkCenter;
import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.util.List;
//import com.rkhd.platform.sdk.test.tool.TestTriggerTool;

/**
 * 付款后更新付款计划
 */
public class PaymentTrigger extends PaymentTrigger.BaseTrigger {
    private Logger logger = LoggerFactory.getLogger();

    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();

        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            int stage = Integer.parseInt(dataModel.getAttribute("stage") + "");
            String contractId = (String) dataModel.getAttribute("contractId");
            double amount = Double.valueOf(dataModel.getAttribute("amount") + "");

            //1 获取本期付款计划
            String sql = "select id,amount from paymentPlan where stage =" + stage + " and contractId = '" + contractId + "'";
            RkhdHttpClient rkhdHttpClient = null;
            try {
                rkhdHttpClient = new RkhdHttpClient();
                RkhdHttpData rkhdHttpData = new RkhdHttpData();
                rkhdHttpData.setCallString("/data/v1/query");
                rkhdHttpData.setCall_type("POST");

                rkhdHttpData.putFormData("q", sql);
                System.out.println("sql---------" + sql);

                String planResultJson = rkhdHttpClient.performRequest(rkhdHttpData);
                System.out.println("planResultJson---------" + planResultJson);
                JSONObject planResult = JSONObject.fromObject(planResultJson);

                double planAmount = planResult.getDouble("amount");
                String id = planResult.getString("id");
                if (Math.abs(amount - planAmount) < 0.01 || amount > planAmount) {//如果实际付款金额>=计划付款金额(考虑尾差),就更新付款计划状态
                    String json = "{id:"+id+",status:已付款}";
                    JSONObject params = new JSONObject();
                    params.put("access_token", "Bearer%20" + getAuthToken());
                    params.put("json", json);

                    //2 更新状态
                    BaseResponse res = NetWorkCenter.post(Configuration.getInstance().getValue("update_entity_data"), params.toString());
                }

            } catch (IOException e) {
                e.printStackTrace();
            }


        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }


    public static void main(String[] args) {
//		TestTriggerTool testTriggerTool = new TestTriggerTool();
//		SaveMettingTrigger saveMettingTrigger = new SaveMettingTrigger();
//		testTriggerTool.test("E:\\ceshiSwing\\meetting\\src\\scriptTrigger.xml", saveMettingTrigger);
    }

    /**
     * 付款后更新付款计划
     */
    public static class BaseTrigger implements ScriptTrigger {
        private Logger logger = LoggerFactory.getLogger();

        protected static String _CURR_AUTHTOKEN = "";
        protected static String SECURCODE = Configuration.getInstance().getValue("securcode");//"cyKgOghI";//租户安全令牌
        private static final String _CODE_TOKEN_URL = Configuration.getInstance().getValue("_code_token_url");//交互认证方式
        private static final String _PWD_TOKEN_URL = Configuration.getInstance().getValue("_pwd_token_url");//静默方式
        private static final String CLIENT_ID = Configuration.getInstance().getValue("client_id");//静默方式
        private static final String CLIENT_SECRET = Configuration.getInstance().getValue("client_secret");//静默方式
        private static final String REDIRECT_URI = Configuration.getInstance().getValue("redirect_uri");//静默方式
        private static final String USERNAME = Configuration.getInstance().getValue("username");//静默方式
        private static final String PASSWORD = Configuration.getInstance().getValue("password");//静默方式

        @Override
        public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam) throws ScriptBusinessException {
            return null;
        }

        public String getAuthToken(){
            if (StringUtils.isEmpty(_CURR_AUTHTOKEN)){
                String pwdParam="grant_type=password&client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&redirect_uri="+REDIRECT_URI+"&username="+USERNAME+"&password="+PASSWORD+SECURCODE;
                String response = NetWorkCenter.sendSimplePost(_PWD_TOKEN_URL, pwdParam);

                if (StringUtils.isNotEmpty(response)){
                    JSONObject result= JSONObject.fromObject(response);
                    _CURR_AUTHTOKEN = result.getString("access_token");
                }
            }

            return _CURR_AUTHTOKEN;
        }
    }
}
