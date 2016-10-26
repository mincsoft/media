package other.aakepi.bdfjfaackcpic.http;

import com.rkhd.platform.sdk.http.CommonData;
import com.rkhd.platform.sdk.http.CommonHttpClient;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;

/**
 * Created by yangyixin on 16/10/5.
 */
public class MincsoftHttpClient {

    private CommonHttpClient client = new CommonHttpClient();
    public static final  int     CONNECT_TIMEOUT = 10 * 1000;
    private static final Logger logger = LoggerFactory.getLogger();
    private String contentEncoding = "UTF-8";
    private static final Charset UTF_8           = Charset.forName("UTF-8");
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

    public MincsoftHttpClient()  {

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




    /**
     * 向指定 URL 发送POST方法的请求
     *
     * @param url
     *            发送请求的 URL
     * @param param
     *            请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
     * @return 所代表远程资源的响应结果
     */
    public static String sendSimplePost(String url, String param) {
        PrintWriter out = null;
        BufferedReader in = null;
        String result = "";
        try {
            URL realUrl = new URL(url);
            // 打开和URL之间的连接
            URLConnection conn = realUrl.openConnection();
            // 设置通用的请求属性
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 发送POST请求必须设置如下两行
            conn.setDoOutput(true);
            conn.setDoInput(true);
            // 获取URLConnection对象对应的输出流
            out = new PrintWriter(conn.getOutputStream());
            // 发送请求参数
            out.print(param);
            // flush输出流的缓冲
            out.flush();
            // 定义BufferedReader输入流来读取URL的响应
            in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
            System.out.println("result:-----------"+result);
        } catch (Exception e) {
            System.out.println("发送 POST 请求出现异常！"+e);
            e.printStackTrace();
        }
        //使用finally块来关闭输出流、输入流
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        return result;
    }


    /**
     * 通用get请求
     *
     * @param getUrl 地址，其中token用#代替
     * @return 请求结果
     */
    public String sendSimpleGet(String url,String param) {
        String resResult="";
        BufferedReader in = null;
        String urlNameString = url;
        if (StringUtils.isNotBlank(param))
            urlNameString+="?"+param;
        System.out.println("url================"+urlNameString);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet var9 = new HttpGet(url);

        try {
            CloseableHttpResponse var10 = httpClient.execute(var9);
            BufferedReader var11 = new BufferedReader(new InputStreamReader(var10.getEntity().getContent()));
            StringBuffer var12 = new StringBuffer();

            while((resResult = var11.readLine()) != null) {
                var12.append(resResult);
            }

            httpClient.getConnectionManager().shutdown();
            System.out.println("result================"+var12.toString());
            return var12.toString();
        } catch (IOException var8) {
            System.out.println("++++++HttpGet URL:" + url);
            var8.printStackTrace();
            return "";
        }
    }

}
