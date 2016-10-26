<%@ page import="other.aakepi.bdfjfaackcpic.api.map.MediaLocationSearch" %>
<%@ page import="java.util.Enumeration" %>
<%@ page contentType="text/json;charset=UTF-8" language="java" %>
<%

  //初始化请求
  com.rkhd.platform.sdk.http.Request rkhdRequest = new com.rkhd.platform.sdk.http.Request();
  Enumeration paramNames = request.getParameterNames();
  while (paramNames.hasMoreElements()) {
    String paramName = (String) paramNames.nextElement();
    String[] paramValues = request.getParameterValues(paramName);
    rkhdRequest.putParameter(paramName,paramValues);
  }


  MediaLocationSearch apiSearch = new MediaLocationSearch();
//  //返回的结果
  String json = apiSearch.execute(rkhdRequest,null,null);
  out.print(json);

%>