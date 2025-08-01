// import { StyleSheet, Text, View } from 'react-native'
// import React, { createContext, useState, useContext } from 'react'
 

// const RegisterContext = createContext();

// export const RegisterProvider = ({ Children }) => {
//      const [registerData, setRegisterData] = useState({
//     surname: '',
//     firstname: '',
//     othername: '',
//     email: '',
//     password: '',
//     dob: '',
//     bvn: '',
//     phonenumber: '',
//     whatsappnumber: '',
//     maritalstatus: '',
//     homeaddress: '',
//     residentaddress: '',
//     lgaOrigin: '',
//     stateOrigin: '',
//     stateResident: '',
//     lgaResident: '',
//     children: '',
//     siblings: '', 
//     parents: '',
    
//   });

//   const updateRegisterData = (newData) => {
//     setRegisterData(prev => ({ ...prev, ...newData }));
//   };


//   return (
//      <RegisterContext.Provider value={{ registerData, setRegisterData, updateRegisterData }}>
//       {Children}
//     </RegisterContext.Provider>
//   )
// }

// export const useRegister = () => {
//   const context = useContext(RegisterContext);
//   if (!context) {
//     throw new Error('useRegister must be used within a RegisterProvider');
//   }
//   return context;
// };
// const styles = StyleSheet.create({})

// context/RegisterContext.tsx or .js
// context/RegisterContext.tsx
import React, { createContext, useContext, useState } from 'react';

const RegisterContext = createContext(null);

export const RegisterProvider = ({ children }) => {
  const [registerData, setRegisterData] = useState({});

  const updateRegisterData = (data) => {
    setRegisterData(prev => ({ ...prev, ...data }));
  };

  return (
    <RegisterContext.Provider value={{ registerData, setRegisterData, updateRegisterData }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return context;
};

