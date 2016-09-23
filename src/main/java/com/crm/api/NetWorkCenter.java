package com.crm.api;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;

/**
 * HTTP请求客户端操作类，基于org.apache.http.client包4.4.x版本实现
 * yjl
 */
public final class NetWorkCenter {

  /**
   * 默认连接超时时间(毫秒)
   * 由于目前的设计原因，该变量定义为静态的，超时时间不能针对每一次的请求做定制
   * 备选优化方案：
   * 1.考虑是否重新设计这个工具类，每次请求都需要创建一个实例;
   * 2.请求方法里加入超时时间参数
   * 或者说是否没必要定制,10秒是一个比较适中的选择，但有些请求可能就是需要快速给出结果T_T
   */
  public static final  int     CONNECT_TIMEOUT = 10 * 1000;
  /**
   * 日志输出组件
   */
  private static final Logger LOG             = LoggerFactory.getLogger();
  private static final Charset UTF_8           = Charset.forName("UTF-8");

  /**
   * 私有化构造器
   * 不允许外界创建实例
   */
  private NetWorkCenter() {
    LOG.warn("Oh,my god!!!How do you call this method?!");
    LOG.warn("You shouldn't create me!!!");
    LOG.warn("Look my doc again!!!");
  }

  /**
   * 发起HTTP POST同步请求
   * jdk8使用函数式方式处理请求结果
   * jdk6使用内部类方式处理请求结果
   *
   * @param url       请求对应的URL地址
   * @param paramData 请求所带参数，目前支持JSON格式的参数
   * @param callback  请求收到响应后回调函数，参数有2个，第一个为resultCode，即响应码，比如200为成功，404为不存在，500为服务器发生错误；
   *                  第二个为resultJson,即响应回来的数据报文
   */
  public static void post(String url, String paramData,
                          NetWorkCenter.ResponseCallback callback) {
    post(url, paramData, null, callback);
  }

  public static BaseResponse post(String url, String paramData) {
    final BaseResponse[] response = new BaseResponse[]{null};
    post(url, paramData, new NetWorkCenter.ResponseCallback() {
      public void onResponse(int resultCode, String resultJson) {
        if (200 == resultCode) {
          BaseResponse r = (BaseResponse)JSON.parse(resultJson);
          r.setErrmsg(resultJson);
          response[0] = r;
        } else {//请求本身就失败了
          response[0] = new BaseResponse();
          response[0].setErrcode(String.valueOf(resultCode));
          response[0].setErrmsg("请求失败");
        }
      }
    });
    return response[0];
  }

  /**
   * 发起HTTP POST同步请求
   * jdk8使用函数式方式处理请求结果
   * jdk6使用内部类方式处理请求结果
   *
   * @param url       请求对应的URL地址
   * @param paramData 请求所带参数，目前支持JSON格式的参数
   * @param fileList  需要一起发送的文件列表
   * @param callback  请求收到响应后回调函数，参数有2个，第一个为resultCode，即响应码，比如200为成功，404为不存在，500为服务器发生错误；
   *                  第二个为resultJson,即响应回来的数据报文
   */
  public static void post(String url, String paramData, List<File> fileList,
                          NetWorkCenter.ResponseCallback callback) {
    doRequest(NetWorkCenter.RequestMethod.POST, url, paramData, fileList, callback);
  }

  public static BaseResponse post(String url, String paramData, List<File> fileList) {
    final BaseResponse[] response = new BaseResponse[]{null};
    post(url, paramData, fileList, new NetWorkCenter.ResponseCallback() {
      public void onResponse(int resultCode, String resultJson) {
        if (200 == resultCode) {
          BaseResponse r = (BaseResponse)JSON.parse(resultJson);
          if(StringUtils.isBlank(r.getErrcode())) {
            r.setErrcode("0");
          }
          r.setErrmsg(resultJson);
          response[0] = r;
        } else {//请求本身就失败了
          response[0] = new BaseResponse();
          response[0].setErrcode(String.valueOf(resultCode));
          response[0].setErrmsg("请求失败");
        }
      }
    });
    return response[0];
  }

  /**
   * 发起HTTP GET同步请求
   * jdk8使用函数式方式处理请求结果
   * jdk6使用内部类方式处理请求结果
   *
   * @param url      请求对应的URL地址
   * @param paramMap GET请求所带参数Map，即URL地址问号后面所带的键值对，很蛋疼的实现方式，后续得改进，还没什么好的方案
   * @param callback 请求收到响应后回调函数，参数有2个，第一个为resultCode，即响应码，比如200为成功，404为不存在，500为服务器发生错误；
   *                 第二个为resultJson,即响应回来的数据报文
   */
  public static void get(String url, Map<String, String> paramMap, NetWorkCenter.ResponseCallback callback) {
    String paramData = null;
    if (null != paramMap && !paramMap.isEmpty()) {
      StringBuilder buffer = new StringBuilder();
      //根据传进来的参数拼url后缀- -!
      for (Map.Entry<String, String> param : paramMap.entrySet()) {
        buffer.append(param.getKey()).append("=").append(param.getValue()).append("&");
      }
      //去掉最后一个&符号
      paramData = buffer.substring(0, buffer.length() - 1);
    }
    doRequest(NetWorkCenter.RequestMethod.GET, url, paramData, null, callback);
  }

  public static JSONObject get(String url) {
    final JSONObject[] response = new JSONObject[]{null};
    doRequest(NetWorkCenter.RequestMethod.GET, url, null, null, new NetWorkCenter.ResponseCallback() {
        JSONObject result = new JSONObject();
      public void onResponse(int resultCode, String resultJson) {
        if (200 == resultCode) {
          result = JSON.parseObject(resultJson);

        } else {//请求本身就失败了
          result.put("errorcode",resultCode);
          result.put("errormsg","请求失败");
        }

        response[0] = result;
      }
    });
    return response[0];
  }

  /**
   * 处理HTTP请求
   * 基于org.apache.http.client包做了简单的二次封装
   *
   * @param method    HTTP请求类型
   * @param url       请求对应的URL地址
   * @param paramData 请求所带参数，目前支持JSON格式的参数
   * @param fileList  需要一起发送的文件列表
   * @param callback  请求收到响应后回调函数，参数有2个，第一个为resultCode，即响应码，比如200为成功，404为不存在，500为服务器发生错误；
   *                  第二个为resultJson,即响应回来的数据报文
   */
  private static void doRequest(final NetWorkCenter.RequestMethod method, final String url,
                                final String paramData, final List<File> fileList, final NetWorkCenter.ResponseCallback callback) {
    //如果url没有传入，则直接返回
    if (StringUtils.isEmpty(url)) {
      LOG.warn("The url is null or empty!!You must give it to me!OK?");
      return;
    }

    //默认期望调用者传入callback函数
    boolean haveCallback = true;
        /*
         * 支持不传回调函数，只输出一个警告，并改变haveCallback标识
		 * 用于一些不需要后续处理的请求，比如只是发送一个心跳包等等
		 */
    if (null == callback) {
      LOG.warn("--------------no callback block!--------------");
      haveCallback = false;
    }

    LOG.debug("-----------------请求地址:-----------------"+url);
    //配置请求参数
    RequestConfig config = RequestConfig.custom().setConnectionRequestTimeout(CONNECT_TIMEOUT).setConnectTimeout(CONNECT_TIMEOUT).setSocketTimeout(CONNECT_TIMEOUT).build();
    CloseableHttpClient client = HttpClientBuilder.create().setDefaultRequestConfig(config).build();
    HttpUriRequest request = null;
    switch (method) {
      case GET:
        String getUrl = url;
        if (null != paramData) {
          getUrl += "?" + paramData;
        }
        request = new HttpGet(getUrl);
        break;
      case POST:
        LOG.debug("请求入参:");
        LOG.debug(paramData);
        request = new HttpPost(url);
        //上传文件
        if (null != fileList && !fileList.isEmpty()) {
          LOG.debug("上传文件...");
//          MultipartEntityBuilder builder = MultipartEntityBuilder.create();
//          for (File file : fileList) {
//            //只能上传文件哦 ^_^
//            if (file.isFile()) {
//              FileBody fb = new FileBody(file);
//              builder.addPart("media", fb);
//            } else {//如果上传内容有不是文件的，则不发起本次请求
//              LOG.warn("The target '{}' not a file,please check and try again!", file.getPath());
//              return;
//            }
//          }
//          if (null != paramData) {
//            builder.addPart("description", new StringBody(paramData, ContentType.APPLICATION_JSON));
//          }
//          ((HttpPost) request).setEntity(builder.build());
        } else {//不上传文件的普通请求
          if (null != paramData) {
            // 目前支持JSON格式的数据
            StringEntity jsonEntity = new StringEntity(paramData.toString(), "UTF-8");
            jsonEntity.setContentEncoding("UTF-8");
            jsonEntity.setContentType("application/json");
            ((HttpPost) request).setEntity(jsonEntity);

          }
        }
        break;
      case PUT:
      case DELETE:
      default:
        LOG.warn("-----------------请求类型暂不支持-----------------:"+method.toString());
        break;
    }
    CloseableHttpResponse response = null;
    try {
      long start = System.currentTimeMillis();
      //发起请求
      response = client.execute(request);
      long time = System.currentTimeMillis() - start;
//      LOG.debug("本次请求'{}'耗时:{}ms", url.substring(url.lastIndexOf("/") + 1, url.length()), time);
      int resultCode = response.getStatusLine().getStatusCode();
      HttpEntity entity = response.getEntity();
      //此流不是操作系统资源，不用关闭，ByteArrayOutputStream源码里close也是个空方法-0_0-
//            OutputStream os = new ByteArrayOutputStream();
//            entity.writeTo(os);
//            String resultJson = os.toString();
      String resultJson = EntityUtils.toString(entity, UTF_8);
      //返回码200，请求成功；其他情况都为请求出现错误
      if (HttpStatus.SC_OK == resultCode) {
        LOG.debug("-----------------请求成功-----------------");
        LOG.debug("响应结果:");
        LOG.debug(resultJson);
        if (haveCallback) {
          callback.onResponse(resultCode, resultJson);
        }
      } else {
        if (haveCallback) {
          LOG.warn("-----------------请求出现错误，错误码:{}-----------------"+resultCode);
          callback.onResponse(resultCode, resultJson);
        }
      }
    } catch (ClientProtocolException e) {
      LOG.error("ClientProtocolException:", e);
      LOG.warn("-----------------请求出现异常:{}-----------------"+e.toString());
      if (haveCallback) {
        callback.onResponse(HttpStatus.SC_INTERNAL_SERVER_ERROR, e.toString());
      }
    } catch (IOException e) {
      LOG.error("IOException:", e);
      LOG.warn("-----------------请求出现IO异常:{}-----------------"+e.toString());
      if (haveCallback) {
        callback.onResponse(HttpStatus.SC_INTERNAL_SERVER_ERROR, e.toString());
      }
    } catch (Exception e) {
      LOG.error("Exception:", e);
      LOG.warn("-----------------请求出现其他异常:{}-----------------"+e.toString());
      if (haveCallback) {
        callback.onResponse(HttpStatus.SC_INTERNAL_SERVER_ERROR, e.toString());
      }
    } finally {
      //abort the request
      if (null != request && !request.isAborted()) {
        request.abort();
      }
      //close the connection
      HttpClientUtils.closeQuietly(client);
      HttpClientUtils.closeQuietly(response);
    }
  }

  /**
   * 标识HTTP请求类型枚举
   *
   * @author peiyu
   * @since 1.0
   */
  enum RequestMethod {
    /**
     * HTTP GET请求
     * 一般对应的是查询业务接口
     */
    GET,
    /**
     * HTTP POST请求
     * 一般对应的是新增业务接口
     * 只是一般都通用这个请求方式来处理一切接口了T_T
     */
    POST,
    /**
     * HTTP PUT请求，用的太少，暂不支持
     * 一般对应的是更新业务接口
     */
    PUT,
    /**
     * HTTP DELETE请求，用的太少，暂不支持
     * 一般对应的是删除业务接口
     */
    DELETE
  }

  /**
   * 自定义HTTP响应回调接口,用于兼容jdk6
   *
   * @author peiyu
   * @since 1.1
   */
//	@FunctionalInterface
  public interface ResponseCallback {
    /**
     * 响应后回调方法
     *
     * @param resultCode 响应结果码，比如200成功，404不存在，500服务器异常等
     * @param resultJson 响应内容，目前支持JSON字符串
     */
    void onResponse(int resultCode, String resultJson);
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
}
