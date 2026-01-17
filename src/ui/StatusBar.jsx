import { createContext, useCallback, useContext, useState } from "react";

const StatusContext = createContext();

const initialStatus = {
    compilation:"Test"
}

export function StatusProvider({ children }) {
  const [status, setStatus] = useState(initialStatus);

  const updateStatus = useCallback((key,value) => {
    setStatus(prev => ({...prev,[key]:value}));
  },[])

  return (
    <StatusContext.Provider value={{ status, updateStatus }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatus() {
  return useContext(StatusContext);
}

export default function StatusBar() {
  const { status } = useStatus();
  return <div className="status-bar">{status.compilation}</div>;
}