import { Checkbox, Row, Col, Tooltip, notification } from "antd";
import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { ReactSVG } from "react-svg";
import "../../styles/style.css";
import KeplrIcon from "../../assets/images/icon-kepler.png";
import FalconIcon from "../../assets/images/icon-falcon.png";
import CosmoIcon from "../../assets/images/icon-cosmo.png";

import accountHttpService from "../../services/account";
import {
  setLogin as setReduxLogin,
  setToken,
  setWebsocketToken,
} from "../../redux/accountSlice";
import { setWalletAddress } from "src/redux/guestSlice";

import PassageLogo from "../../assets/images/Passage_VerticalLogoWhite 1.svg";
import createAction from "../../assets/images/create_action.svg";
import showPasswordIcon from "../../assets/images/show_password.svg";
import hidePasswordIcon from "../../assets/images/hide_password.svg";
import loginBg from "../../assets/images/signin-bg.png";

import { useDispatch, useSelector } from "react-redux";
import SetCookie from "../../hooks/cookies/SetCookies";
import RemoveCookie from "../../hooks/cookies/RemoveCookies";
import Toast from "../../components/custom/CustomToast";
import { googleAnalyticsActions } from "../../utils/googleAnalyticsInit";
import { TRACKING_ID } from "../../utils/globalConstant";
import Wallet from "src/services/wallet";

export default function LogInForm({ alpha, handleRedirection, closeModal }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isHidePassword, setShowHidePass] = useState(true);
  const [isDontLogout, setDontlogout] = useState(true);

  // check if user is logged in or connected with wallet
  const token = useSelector((state) => state.account.token);
  const connectedAddressOnly = localStorage.getItem("active_address");

  const dispatch = useDispatch();

  const history = useHistory();
  useEffect(() => {
    const keyHandle = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        loginPressed();
      }
    };
    document.addEventListener("keydown", keyHandle);
    return () => {
      document.removeEventListener("keydown", keyHandle);
    };
  });

  useEffect(() => {
    googleAnalyticsActions.initGoogleAnalytics("UA-262724853-1");
    setDontlogout(isDontLogout);
  }, [isDontLogout]);

  const connectWallet = async (walletType) => {
    try {
      const walletAddress = await Wallet.connectWallet(walletType);

      if (!walletAddress) {
        throw new Error("Wallet address is undefined");
      }

      localStorage.setItem("active_address", walletAddress);
      dispatch(setWalletAddress(walletAddress));
      Toast.success("Connected", `Wallet address ${walletAddress} connected`);
      closeModal();
    } catch (err) {
      Toast.error("Error", "Issue connecting wallet");
      console.log("err", err);
    }
  };
  const disconnectWallet = async (walletType) => {
    localStorage.removeItem("active_address");
    dispatch(setWalletAddress(null));
    Toast.success("Disconnected", `Wallet disconnected`);
    closeModal();
  };

  function loginPressed() {
    if (!login || !password) {
      notification.error({
        message: "Invalid fields",
        description: "Please fill all fields!",
      });
      return;
    }

    accountHttpService
      .login(login, password, isDontLogout)
      .then((response) => {
        console.debug("login: ", response);

        if (response.status === 200) {
          RemoveCookie("userInput"); // removed previous cookies
          RemoveCookie("userDetails");
          localStorage.clear();
          localStorage.setItem("token", response.data.token);
          //set new cookies
          SetCookie("userInput", JSON.stringify(response.data));
          dispatch(setReduxLogin(login));
          dispatch(setToken(response.data.token));
          dispatch(setWalletAddress(null));
          setupWebsocketToken();
          history.push("/discover");
          Toast.success(response.data.title, response.data.message);
          googleAnalyticsActions.initGoogleAnalytics(
            TRACKING_ID,
            "login",
            "login_Successful"
          );
          if (closeModal) {
            closeModal();
          }
          handleRedirection();
        }

        if (response.status === 403) {
          Toast.error("Login failed", response.data.message);
        }

        if (response.status === 403) {
          Toast.error("Login failed", response.data.message);
        }
      })
      .catch((error) => {
        RemoveCookie("userInput"); // removed previous cookies
        RemoveCookie("userDetails");
        // Toast.error(error.response.data.title, error.response.data.message)
        Toast.error("Login Failed", "Incorrect username or password");
      });
  }
  function setupWebsocketToken() {
    accountHttpService.getWebsocketToken().then((res) => {
      dispatch(setWebsocketToken(res.data.wsToken));
    });
  }

  // temporary solution, better to implement a switch statement here later imo
  return !token && connectedAddressOnly && alpha ? (
    <>
      <Row>
        <Col
          className=""
          xs={18}
          sm={11}
          md={8}
          lg={8}
          xl={5}
          style={{
            background: `url(${loginBg}) no-repeat`,
            textAlign: "center",
            borderRadius: "24px",
            pointerEvents: "auto",
            maxWidth: "390px",
            minWidth: "350px",
          }}
        >
          <Row justify="center">
            <Col span={24} style={{ textAlign: "center" }}>
              <ReactSVG src={PassageLogo}></ReactSVG>
            </Col>
            <Col
              span={24}
              className="login_text_heading"
              style={{ padding: "16px" }}
            >
              <button onClick={disconnectWallet} className="auth-button">
                DISCONNECT WALLET
              </button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  ) : (
    <>
      <Row>
        <Col
          className=""
          xs={18}
          sm={11}
          md={8}
          lg={8}
          xl={5}
          style={{
            background: `url(${loginBg}) no-repeat`,
            textAlign: "center",
            borderRadius: "24px",
            pointerEvents: "auto",
            maxWidth: "390px",
            minWidth: "350px",
          }}
        >
          <Row justify="center">
            <Col span={24} style={{ textAlign: "center" }}>
              <ReactSVG src={PassageLogo}></ReactSVG>
            </Col>
            <Col span={24} className="login_text_heading">
              LOG IN
            </Col>
            <Col span={24}>
              <input
                className="logIn-input"
                onChange={(event) => {
                  setLogin(event.currentTarget.value);
                }}
                placeholder="USERNAME OR EMAIL"
                type="text"
              ></input>
            </Col>
            <Col span={24} style={{ marginBottom: "8px" }}>
              <div className="eye_icon">
                <input
                  onChange={(event) => {
                    setPassword(event.currentTarget.value);
                  }}
                  type={isHidePassword ? "password" : "text"}
                  className="logIn-input"
                  placeholder="PASSWORD"
                />
                <button
                  type="button"
                  onClick={() => setShowHidePass(!isHidePassword)}
                >
                  {isHidePassword ? (
                    <ReactSVG src={hidePasswordIcon}></ReactSVG>
                  ) : (
                    <ReactSVG src={showPasswordIcon}></ReactSVG>
                  )}
                </button>
              </div>
            </Col>
            <Col
              span={20}
              className="remember-row"
              style={{ marginBottom: "16px", fontFamily: "Montserrat" }}
            >
              <Row justify="space-between">
                <Col span={12}>
                  <Checkbox
                    defaultChecked={isDontLogout}
                    onChange={() => setDontlogout(!isDontLogout)}
                    style={{ color: "grey", fontFamily: "Open Sans" }}
                  >
                    Don't log out
                  </Checkbox>
                </Col>
                <Col
                  className="forgot-password"
                  span={12}
                  style={{
                    color: "grey",
                  }}
                >
                  <Link
                    to="/reset-password"
                    style={{
                      textDecoration: "none",
                      fontFamily: "Open Sans",
                      color: "grey",
                    }}
                  >
                    Forgot password
                  </Link>
                </Col>
                <Col span={24} style={{ marginTop: "15px" }}>
                  <button
                    onClick={(event) => loginPressed()}
                    className="auth-button"
                  >
                    LOG IN
                  </button>
                  {alpha && (
                    <>
                      <Col span={24} className="login_text_heading">
                        NON-ALPHA USERS
                      </Col>
                      <Col
                        span={24}
                        className="login_text_heading"
                        style={{ margin: "0px" }}
                      >
                        <div>
                          <div
                            style={{
                              gap: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip placement="bottom" title={"Keplr"}>
                              <img
                                src={KeplrIcon}
                                onClick={() => connectWallet("keplr")}
                                alt="keplr"
                              />
                            </Tooltip>
                            {/*<Tooltip placement="bottom" title={"Cosmostation"}>
                              <img
                                src={CosmoIcon}
                                onClick={() => connectWallet("cosmos")}
                                alt="cosmostation"
                              />
                            </Tooltip>
                            <Tooltip placement="bottom" title={"Falcon"}>
                              <img
                                src={FalconIcon}
                                onClick={() => connectWallet("falcon")}
                                alt="falcon"
                              />
                          </Tooltip>*/}
                          </div>
                        </div>
                      </Col>
                    </>
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    textAlign: "center",
                    color: "grey",
                    fontFamily: "Montserrat",
                    fontSize: "14px",
                    marginBottom: "15px",
                    marginTop: "15px",
                  }}
                ></Col>
                {!alpha && (
                  <Col style={{ marginBottom: 12, marginTop: 12 }} span={24}>
                    <Link to="/registration">
                      <button
                        className="auth-button"
                        style={{
                          border: "none",
                          backgroundColor: "none",
                          marginBottom: "20px",
                          background: "none",
                        }}
                      >
                        CREATE A FREE ACCOUNT
                        <ReactSVG
                          src={createAction}
                          style={{
                            display: "inline-block",
                            marginLeft: "10px",
                          }}
                        ></ReactSVG>
                      </button>
                    </Link>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}
