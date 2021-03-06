/* eslint-disable react-native/no-inline-styles */
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Platform,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  Text,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import deviceInfo from "../util/deviceInfo";
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
  DialogTitle,
  ScaleAnimation,
} from "react-native-popup-dialog";

const phoneWidth =
  Platform.OS == "web"
    ? Dimensions.get("window").width < 800
      ? Dimensions.get("window").width - 100
      : 350
    : Dimensions.get("window").width - 100;

const App = ({ navigation }) => {
  const [searchButton, setSearchButton] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textCedula, setTextCedula] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [foundVisible, setFoundVisible] = useState(false);
  const [studentData, setStudentData] = useState({});
  const [apiData, setApiData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [errorContent, setErrorContent] = useState({
    visible: false,
    message: "",
    title: "",
  });

  const errorAlert = (
    <Dialog
      visible={errorContent.visible}
      dialogAnimation={
        new ScaleAnimation({
          initialValue: 0,
          useNativeDriver: true,
        })
      }
      dialogTitle={
        <DialogTitle
          style={{ backgroundColor: "#2b2b2b" }}
          textStyle={{ color: "white", fontWeight: "bold", fontSize: 20 }}
          title={
            <Text>
              {errorContent.title}{" "}
              <MaterialIcons name="error" size={16} color="#FF416C" />
            </Text>
          }
        />
      }
      footer={
        <DialogFooter style={{ backgroundColor: "#2b2b2b" }}>
          <></>
          <DialogButton
            style={{ backgroundColor: "#2b2b2b" }}
            text="Aceptar"
            onPress={() => setErrorContent({ ...errorContent, visible: false })}
          />
        </DialogFooter>
      }
    >
      <DialogContent style={{ backgroundColor: "#2b2b2b" }}>
        <Text
          style={{
            fontSize: 18,
            color: "white",
            backgroundColor: "#2b2b2b",
          }}
        >
          {errorContent.message}
        </Text>
      </DialogContent>
    </Dialog>
  );
  const searchBtn = async () => {
    Keyboard.dismiss();
    if (textInput.length >= 9 && /^\d+$/.test(textInput)) {
      setLoadingData(true);
      setSearchButton(true);
      setTextCedula(textInput);
      await fetch(
        `https://api.lxndr.dev/uae/notas/v2/?cedula=${textInput}&analytics=${JSON.stringify(
          deviceInfo
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            return setErrorContent({
              visible: true,
              message: data.message,
              title: "Error",
            });
          }
          setApiData(data);
          setStudentData({
            nombres: data.nombres,
            apellidos: data.apellidos,
            carrera: data.carrera,
            facultad: data.facultad,
            sede: data.sede,
          });
          setFoundVisible(true);
        })
        .catch((err) => {
          setErrorContent({
            visible: true,
            message: "Error de conexi??n. M??s informaci??n: \n" + err.message,
            title: "Error",
          });
        });
      setLoadingData(null);
      setSearchButton(false);
    } else if (textInput.length > 5 && !/^\d+$/.test(textInput)) {
      setLoadingData(true);
      setSearchButton(true);
      await fetch(`https://api.lxndr.dev/util/cedula?nombres=${textInput}`)
        .then((res) => res.json())
        .then(async (data) => {
          let cedula = data[0].identificacion;
          if (data[0].tipoIdentificacion == "R") {
            cedula = data[0].identificacion.substring(
              0,
              data[0].identificacion.length - 3
            );
          }
          setTextCedula(cedula);
          await fetch(
            `https://api.lxndr.dev/uae/notas/v2/?cedula=${cedula}&analytics=${JSON.stringify(
              deviceInfo
            )}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                return setErrorContent({
                  visible: true,
                  message: data.message,
                  title: "Error",
                });
              }
              setApiData(data);
              setStudentData({
                nombres: data.nombres,
                apellidos: data.apellidos,
                carrera: data.carrera,
                facultad: data.facultad,
                sede: data.sede,
              });
              setFoundVisible(true);
            })
            .catch((err) => {
              setErrorContent({
                visible: true,
                message: "Error de conexi??n. M??s informaci??n: \n" + err.message,
                title: "Error",
              });
            });
        })
        .catch((err) => {
          setErrorContent({
            visible: true,
            message: `No se encontr?? ning??n estudiante con ese nombre.\n${textInput}`,
            title: "Error",
          });
        });
      setLoadingData(null);
      setSearchButton(false);
    } else {
      setErrorContent({
        visible: true,
        message: "Ingrese un n??mero de c??dula v??lido o nombres completos.",
        title: "Error",
      });
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      disabled={Platform.OS === "web" ? true : false}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <StatusBar backgroundColor="black" />
          <View style={{ alignSelf: "center", flexDirection: "row" }}>
            <Text style={{ color: "white", fontSize: 32 }}>
              Consulta de Notas
            </Text>
            <TouchableOpacity
              onPress={() => {
                setPopupVisible(true);
                Keyboard.dismiss();
              }}
              style={styles.buttonInfoCont}
            >
              <LinearGradient
                colors={["#18bc9c", "#128f76"]}
                style={styles.buttonInfo}
              >
                <MaterialIcons name="info" size={30} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Image
            style={styles.tinyLogo}
            source={require("../assets/uaeLOGO.png")}
          />
          {errorAlert}
          <Dialog
            visible={popupVisible}
            dialogAnimation={
              new ScaleAnimation({
                initialValue: 0,
                useNativeDriver: true,
              })
            }
            dialogTitle={
              <DialogTitle
                style={{ backgroundColor: "#2b2b2b" }}
                textStyle={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                title="Informaci??n | UAE-SICAU"
              />
            }
            footer={
              <DialogFooter style={{ backgroundColor: "#2b2b2b" }}>
                <DialogButton
                  style={{ backgroundColor: "#2b2b2b" }}
                  text="Ver c??digo fuente"
                  textStyle={{ color: "#31AA84" }}
                  onPress={() =>
                    Platform.OS == "web"
                      ? window.open(
                          "https://github.com/lxndr-rl/UAE-SICAU",
                          "_blank"
                        )
                      : Linking.openURL("https://github.com/lxndr-rl/UAE-SICAU")
                  }
                />
                <DialogButton
                  style={{ backgroundColor: "#2b2b2b" }}
                  text="Bug Tracker"
                  textStyle={{ color: "#CC5500" }}
                  onPress={() =>
                    Platform.OS == "web"
                      ? window.open(
                          `https://github.com/lxndr-rl/UAE-SICAU/issues/`,
                          "_blank"
                        )
                      : Linking.openURL(
                          `https://github.com/lxndr-rl/UAE-SICAU/issues/`
                        )
                  }
                />
                <DialogButton
                  style={{ backgroundColor: "#2b2b2b" }}
                  textStyle={{ color: "#D22B2B" }}
                  text="Cerrar"
                  onPress={() => setPopupVisible(false)}
                />
                <Text
                  style={{
                    alignSelf: "center",
                    color: "white",
                    backgroundColor: "#2b2b2b",
                  }}
                >
                  lxndr
                </Text>
              </DialogFooter>
            }
          >
            <DialogContent style={{ backgroundColor: "#2b2b2b" }}>
              <Text
                style={{
                  fontSize: 18,
                  color: "white",
                  backgroundColor: "#2b2b2b",
                }}
              >
                Esta aplicaci??n fue hecha de forma independiente y es de c??digo
                abierto.{"\n\n"}NO asociada a la Universidad Agraria del
                Ecuador.
              </Text>
            </DialogContent>
          </Dialog>
          <Dialog
            visible={foundVisible}
            dialogAnimation={
              new ScaleAnimation({
                initialValue: 0,
                useNativeDriver: true,
              })
            }
            dialogTitle={
              <DialogTitle
                style={{ backgroundColor: "#2b2b2b" }}
                textStyle={{ color: "white", fontWeight: "bold", fontSize: 20 }}
                title="Estudiante encontrado"
              />
            }
            footer={
              <DialogFooter style={{ backgroundColor: "#2b2b2b" }}>
                <DialogButton
                  style={{ backgroundColor: "#2b2b2b" }}
                  textStyle={{ color: "#D22B2B" }}
                  text="Cancelar"
                  onPress={() => setFoundVisible(false)}
                />
                <DialogButton
                  style={{ backgroundColor: "#2b2b2b" }}
                  textStyle={{ color: "#31AA84" }}
                  text="Continuar"
                  onPress={() => {
                    setFoundVisible(false);
                    navigation.navigate("Notas", {
                      name: `${studentData.nombres} ${studentData.apellidos}`,
                      data: apiData,
                      cedula: textCedula,
                    });
                  }}
                />
              </DialogFooter>
            }
          >
            <DialogContent style={{ backgroundColor: "#2b2b2b" }}>
              <Text
                style={{
                  fontSize: 18,
                  color: "white",
                  backgroundColor: "#2b2b2b",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  Nombres:
                </Text>{" "}
                {studentData.apellidos} {studentData.nombres}
                {"\n\n"}
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  Carrera:
                </Text>{" "}
                {studentData.carrera}
                {"\n\n"}
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  Sede:
                </Text>{" "}
                {studentData.sede}
                {"\n\n"}
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  Facultad:
                </Text>{" "}
                {studentData.facultad}
              </Text>
            </DialogContent>
          </Dialog>
          <TouchableOpacity disabled={searchButton} onPress={() => searchBtn()}>
            <LinearGradient
              colors={["#18bc9c", "#128f76"]}
              style={styles.button}
            >
              {loadingData ? (
                <ActivityIndicator size={"large"} color={"white"} />
              ) : (
                <MaterialIcons name="search" size={40} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ paddingTop: 10 }}>
            <TextInput
              autoCorrect={false}
              autoCompleteType={"off"}
              value={textInput}
              onSubmitEditing={() => searchBtn()}
              style={styles.input}
              placeholder={"C??dula o Apellidos Nombres"}
              onChangeText={(cedula) => setTextInput(cedula)}
              placeholderTextColor={"gray"}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignSelf: "center",
    padding: 10,
    justifyContent: "center",
    margin: 50,
  },
  tinyLogo: {
    width: 200,
    height: 200,
    padding: 20,
    margin: 10,
    alignSelf: "center",
  },
  button: {
    padding: 20,
    alignItems: "center",
    borderRadius: 40,
    fontSize: 35,
    fontWeight: "bold",
    color: "white",
    width: phoneWidth - 70,
    alignSelf: "center",
    marginBottom: 10,
  },
  buttonInfo: {
    alignItems: "center",
    marginLeft: 5,
    borderRadius: 15,
  },
  buttonInfoCont: {
    alignSelf: "center",
  },
  paragraphStyle: {
    padding: 20,
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  input: {
    width: phoneWidth - 70,
    paddingRight: 10,
    paddingLeft: 10,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    alignSelf: "center",
  },
});
