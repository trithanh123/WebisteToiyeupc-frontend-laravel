import React, { createContext, useState, useEffect } from 'react';

export const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [activeBranch, setActiveBranch] = useState(null);

  useEffect(() => {

    const savedBranch = localStorage.getItem('activeBranch');
    if (savedBranch) {
      try {
        setActiveBranch(JSON.parse(savedBranch));
      } catch (e) {
        console.error("Failed to parse saved branch", e);
      }
    }
  }, []);

  const setBranch = (branch) => {
    setActiveBranch(branch);
    if (branch) {
      localStorage.setItem('activeBranch', JSON.stringify(branch));
    } else {
      localStorage.removeItem('activeBranch');
    }
  };

  return (
    <BranchContext.Provider value={{ activeBranch, setBranch }}>
      {children}
    </BranchContext.Provider>
  );
};
