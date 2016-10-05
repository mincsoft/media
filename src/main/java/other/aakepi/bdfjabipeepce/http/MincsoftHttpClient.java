package other.aakepi.bdfjabipeepce.http;

import com.rkhd.platform.sdk.http.*;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import net.sf.json.JSONObject;

import java.io.IOException;

/**
 * Created by yangyixin on 16/10/5.
 */
public class MincsoftHttpClient  {

    private CommonHttpClient client = new CommonHttpClient();
    private static final Logger logger = LoggerFactory.getLogger();
    private String contentEncoding = "UTF-8";
    private String contentType = "application/json";
    private int socketTimeout = 10000;
    private int connectionTimeout = 10000;
    private String userName;
    private String password;
    private String securityCode;
    private String clientId;
    private String clientSecret;
    private String accessToken;

    public MincsoftHttpClient(Request request) throws IOException {
        this.constructorImpl(request);
    }

    private void constructorImpl(Request request) {
        this.accessToken = request.getParameter("access_token");
//        logger.debug("accessToken="+accessToken);
    }

    public String performRequest(RkhdHttpData data) throws IOException {
        logger.info(data.toString());
        CommonData commonData = new CommonData();

        commonData.setCallString(data.getCallString());
        commonData.setCall_type(data.getCall_type());
        commonData.setBody(data.getBody());
        commonData.putFormDataAll(data.getFormData());
        if(data.getFormData().size() == 0) {
            commonData.putHeader("Content-Type", this.contentType);
        }

        commonData.putHeader("Authorization", "Bearer " + this.accessToken);
        return this.client.performRequest(commonData);
    }

    public void close() {
        this.client.close();
    }

    public void setContentEncoding(String contentEncoding) {
        this.contentEncoding = contentEncoding;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
}
