import "./App.css";
import { Provider } from "react-redux";
import store from "./store";
import AppWrapper from "./components/AppWrapper";
import GlobalModalManager from "./components/GlobalModalManager";

function App() {
  return (
    <Provider store={store}>
      <>
        <AppWrapper />
        <GlobalModalManager /> 
      </>
    </Provider>
  );
}

export default App;
