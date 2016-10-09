package other.aakepi.bdfjfaackcpic.util;

import org.apache.commons.lang.StringUtils;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.ParseException;
/**
 * Created by yangyixin on 16/10/9.
 */
public class DoubleUtil {

    /**
     * 由于Java的简单类型不能够精确的对浮点数进行运算，这个工具类提供精 确的浮点数运算，包括加减乘除和四舍五入。
     */

    // 默认除法运算精度
    private static final int DEF_DIV_SCALE = 10;

    /**
     * 返回指定精度的double值，小数点后默认2位
     *
     * @param value 原值
     * @return
     */
    public static Double getValue(Double value) {
        return getValue(value, 2);
    }

    /**
     * 返回指定精度的double值，小数点后默认2位
     *
     * @param value 原值
     * @return
     */
    public static Double getValue(Double value, int scale) {
        if (value == null)
            return null;
        BigDecimal big = new BigDecimal(value);
        return big.setScale(scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 返回指定精度的double值，小数点后默认2位
     *
     * @param value 原值
     * @return
     */
    public static Double getValue(Double value, int scale, double defaultValue) {
        if (value == null)
            return defaultValue;
        BigDecimal big = new BigDecimal(value);
        return big.setScale(scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 返回指定精度的double值，小数点后默认2位
     *
     * @param value 原值
     * @return
     */
    public static Double getValueCeiling(Double value, int scale) {
        if (value == null)
            return null;
        BigDecimal big = new BigDecimal(value);
        return big.setScale(scale, BigDecimal.ROUND_CEILING).doubleValue();
    }

    /**
     * 返回指定精度的double值，小数点后默认2位
     *
     * @param value 原值
     * @return
     */
    public static double getValue(double value) {
        return getValue(value, 2);
    }

    /**
     * 返回指定精度的double值
     *
     * @param value 原值
     * @param scale 小数点儿后位数
     * @return
     */
    public static double getValue(double value, int scale) {
        BigDecimal big = new BigDecimal(value);
        return big.setScale(scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 返回指定字符串的，doub。如果value为空或格式不存在则返回null
     *
     * @param value
     * @return
     */
    public static Double getValue(String value) {
        if (StringUtils.isBlank(value))
            return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 返回指定字符串的，指定精度的double对象。如果value为空或格式不存在则返回null
     *
     * @param value
     * @param scale
     * @return
     */
    public static Double getValue(String value, int scale) {
        if (StringUtils.isBlank(value))
            return null;
        try {
            double doubleValue = Double.parseDouble(value);
            return getValue(doubleValue, scale);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 返回指定字符串的，指定精度的double对象。如果value为空或格式不存在则返回defualtValue
     *
     * @param value
     * @param scale
     * @param defualtValue
     * @return
     */
    public static Double getValue(String value, int scale, double defualtValue) {
        if (StringUtils.isBlank(value))
            return defualtValue;
        try {
            double doubleValue = Double.parseDouble(value);
            return getValue(doubleValue, scale);
        } catch (NumberFormatException e) {
            return defualtValue;
        }
    }

    /**
     * 返回指定字符串的，指定精度的double对象。如果value为空或格式不存在则返回defualtValue
     *
     * @param value
     * @param defualtValue
     * @return
     */
    public static Double getValue(String value, double defualtValue) {
        return getValue(value, 2, defualtValue);
    }

    /**
     * 提供精确的加法运算。
     *
     * @param v1 被加数
     * @param v2 加数
     * @return 两个参数的和
     */

    public static double add(double v1, double v2) {

        return getValue(v1 + v2);
    }

    /**
     * 提供精确的加法运算。
     *
     * @param v1 被加数
     * @param v2 加数
     * @return 两个参数的和
     */

    public static double add(double v1, double v2, double v3, double v4, double v5, double v6) {

        return getValue(v1 + v2 + v3 + v4 + v5 + v6);
    }

    /**
     * 提供精确的减法运算。
     *
     * @param v1 被减数
     * @param v2 减数
     * @return 两个参数的差
     */

    public static double sub(double v1, double v2) {

        return getValue(v1 - v2);
    }

    /**
     * 提供精确的乘法运算。
     *
     * @param v1 被乘数
     * @param v2 乘数
     * @return 两个参数的积
     */

    public static double mul(double v1, double v2) {
        return getValue(v1 * v2);
    }

    /**
     * 提供精确的乘法运算。
     *
     * @param v1 被乘数
     * @param v2 乘数
     * @return 两个参数的积
     */

    public static double mul(double v1, double v2, int scale) {
        return getValue(v1 * v2, scale);
    }

    /**
     * 提供（相对）精确的除法运算，当发生除不尽的情况时，精确到 小数点以后10位，以后的数字四舍五入。
     *
     * @param v1 被除数
     * @param v2 除数
     * @return 两个参数的商
     */

    public static double div(double v1, double v2) {
        return div(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * 提供（相对）精确的除法运算。当发生除不尽的情况时，由scale参数指 定精度，以后的数字四舍五入。
     *
     * @param v1    被除数
     * @param v2    除数
     * @param scale 表示表示需要精确到小数点以后几位。
     * @return 两个参数的商
     */

    public static double div(double v1, double v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The   scale   must   be   a   positive   integer   or   zero");
        }
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.divide(b2, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 提供精确的小数位四舍五入处理。
     *
     * @param v     需要四舍五入的数字
     * @param scale 小数点后保留几位
     * @return 四舍五入后的结果
     */

    public static double round(double v, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The   scale   must   be   a   positive   integer   or   zero");
        }
        BigDecimal b = new BigDecimal(Double.toString(v));
        BigDecimal one = new BigDecimal("1");

        return b.divide(one, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    public static double negate(double v) {
        BigDecimal b = new BigDecimal(v);
        return b.negate().setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 当浮点型数据位数超过10位之后，数据变成科学计数法显示。用此方法可以使其正常显示。
     *
     * @param value
     * @return Sting
     */
    public static String format(double value) {
        if (value != 0.00) {
            java.text.DecimalFormat df = new java.text.DecimalFormat("########.00");
            return df.format(value);
        } else {
            return "0.00";
        }

    }

    public static void main(String[] args) {
//        System.out.println(getValue(null));
        System.out.println(getValue("aaa"));
        System.out.println(getValue("10", 0));
        System.out.println(getValue("10.123455"));
        System.out.println(getValue("10.125455", 2));
        System.out.println(getValue("abdc", 2, 0));
        System.out.println(getValue(100.123, 2));
        java.text.DecimalFormat df = new java.text.DecimalFormat("0.0###");

        System.out.println(df.format(12.12345));
        System.out.println(df.format(0.2));

        System.out.println(df.format(0.0120));
        System.out.println(mul(0.1234, 1000));
        System.out.println(sub(100.01, 91.03));
        System.out.println(negate(-10));

        System.out.println((getValue(275000 / 7, 2)));
        System.out.println(Math.abs(1500000 * 1000 - mul(getValue(83333, 2) * 100, 1.80 * 10)) < 1000);
        System.out.println(getValueCeiling(5.01d, 0));

        System.out.println(mul(100.2123, 100.1));
        System.out.println(format(12345678901d));
        System.out.println(Double.valueOf(3322.10000000001d));

        double value = 2677;
        System.out.println(value);
        System.out.println((getValue("26077", 1)));
        System.out.println((getValue("26077", 0)));

        try {
            System.out.println(NumberFormat.getPercentInstance().parse("100%"));
            System.out.println(NumberFormat.getInstance().parse("10,000.11"));
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }
}