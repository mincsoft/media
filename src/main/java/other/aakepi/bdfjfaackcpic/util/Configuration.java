/**
 * 
 */
package other.aakepi.bdfjfaackcpic.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * 读取平台应用配置工具类
 * @author yu
 * @date 2013-10-18
 */
public class Configuration {
	private Properties properties;
	private final static Configuration cfg = new Configuration();

	private Configuration() {
		properties = new Properties();
		InputStream is = null;
		try {
			is = getClass().getResourceAsStream("/oauthConfig.properties");
			properties.load(is);
		} catch (Exception exception) {
			exception.printStackTrace();
		} finally {
			try {
				if (is != null)
					is.close();
			} catch (IOException exception) {
				// ignored
			}
		}
	}

	/**
	 * Use singleton pattern, only return one instance of Configuration.
	 * 
	 * @return Configuration
	 */
	public static Configuration getInstance() {
		return cfg;
	}

	/**
	 * Retun a value for certain key.
	 * 
	 * @param key
	 *            a certain key define in properties file.
	 * @return value
	 */
	public String getValue(String key) {
		return properties.getProperty(key,"");
	}

  public String getValue(String key,String defaultValue) {
    return properties.getProperty(key,defaultValue);
  }
}
