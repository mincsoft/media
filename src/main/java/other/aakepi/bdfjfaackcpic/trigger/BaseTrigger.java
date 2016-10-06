package other.aakepi.bdfjfaackcpic.trigger;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.http.MincsoftHttpClient;
import other.aakepi.bdfjfaackcpic.util.Configuration;
//import com.rkhd.platform.sdk.test.tool.TestTriggerTool;

/**
 * 付款后更新付款计划
 */
public class BaseTrigger implements ScriptTrigger {
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
            String response = MincsoftHttpClient.sendSimplePost(_PWD_TOKEN_URL, pwdParam);

            if (StringUtils.isNotEmpty(response)){
                JSONObject result= JSONObject.fromObject(response);
                _CURR_AUTHTOKEN = result.getString("access_token");
            }
        }

        return _CURR_AUTHTOKEN;
    }
}
