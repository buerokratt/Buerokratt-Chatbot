import { createContext } from 'react';

interface CsaActivityContextType {
  chatCsaActive: boolean;
  setChatCsaActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const CsaActivityContext = createContext<CsaActivityContextType>({
  chatCsaActive: false,
  setChatCsaActive: () => {},
});

export default CsaActivityContext;
