package com.crm.api;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.crm.enums.ResultType;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import org.apache.commons.lang.StringUtils;

import java.io.File;

/**
 * API基类，提供一些通用方法
 * 包含自动刷新token、通用get post请求等
 *
 * @author yjl
 * @since 1.2
 */
public abstract class BaseAPI {

  protected Logger LOG = LoggerFactory.getLogger();

  protected static final String BASE_API_URL = "";
  protected static String _CURR_AUTHTOKEN = "";
  protected static String SECURCODE = "cyKgOghI";//租户安全令牌

  private static final String _CODE_TOKEN_URL = "https://api.xiaoshouyi.com/oauth2/token.action";//交互认证方式
  private static final String _PWD_TOKEN_URL = "https://api.xiaoshouyi.com/oauth2/token";//静默方式



  public String getAuthToken(){
    if (StringUtils.isEmpty(_CURR_AUTHTOKEN)){
      String codeParam="grant_type=authorization_code&client_id=e3829850419b7ec442b0314c3cf2ff58&client_secret=562e34991cd545d5f499a3331b5cb592&redirect_uri=http://localhost&code=5385578c7137a40a75206c543605d3957a3355d78d3e2de0279cc6cb0f3a7e07";
      String pwdParam="grant_type=password&client_id=e3829850419b7ec442b0314c3cf2ff58&client_secret=562e34991cd545d5f499a3331b5cb592&redirect_uri=http://localhost&username=18800004505&password=1qaz2wsx"+SECURCODE;
      String response = NetWorkCenter.sendSimplePost(_PWD_TOKEN_URL, pwdParam);

      if (StringUtils.isNotEmpty(response)){
        JSONObject result= JSON.parseObject(response);
        _CURR_AUTHTOKEN = result.getString("access_token");
      }
    }

    return _CURR_AUTHTOKEN;
  }

  /**
   * 通用post请求
   *
   * @param url  地址，其中token用#代替
   * @param json 参数，json格式
   * @return 请求结果
   */
  protected BaseResponse executePost(String url, String json) {
    return executePost(url, json, null);
  }

  /**
   * 通用post请求
   *
   * @param postUrl  地址，其中token用#代替
   * @param json 参数，json格式
   * @param file 上传的文件
   * @return 请求结果
   */
  protected BaseResponse executePost(String postUrl, String json, File file) {
    BaseResponse response;
    if (StringUtils.isEmpty(postUrl)){
      LOG.error("url is null");
      return null;
    }
    response = NetWorkCenter.post(postUrl, json);
    return response;
  }


  /**
   * 通用get请求
   *
   * @param getUrl 地址，其中token用#代替
   * @return 请求结果
   */
  protected JSONObject executeGet(String getUrl) {
    JSONObject response;
    if (StringUtils.isEmpty(getUrl)){
      LOG.error("url is null");
      return null;
    }
    //需要传token
//    String getUrl = url.replace("#", componentConfig.getAppAccessToken(getTenantAppid()));
    response = NetWorkCenter.get(getUrl);
//    if("40001".equalsIgnoreCase(response.getErrcode())){
//      //重新刷新token
//      componentConfig.refreshAppAccessToken(getTenantAppid());
//      return executeGet(url);
//    }
    return response;
  }

  /**
   * 判断本次请求是否成功
   *
   * @param errCode 错误码
   * @return 是否成功
   */
  protected boolean isSuccess(String errCode) {
    return ResultType.SUCCESS.getCode().toString().equals(errCode);
  }


}
