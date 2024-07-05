"use client";

import Link from "next/link";
import type { NextPage } from "next";
// import { useAccount } from "wagmi"; // From base code
import { PencilIcon } from "@heroicons/react/24/outline";
import Select, { SingleValue } from 'react-select';
import React, { useState, ChangeEvent } from 'react';
import * as viemChains from 'viem/chains';

import { GenericContractsDeclaration, setContracts, deepMergeContracts as importedContracts } from '~~/utils/scaffold-eth/contract';
// import { setContracts } from '~~/utils/scaffold-eth/contract';
// import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

import { updateTargetNetworks } from '~~/scaffold.config';

interface ChainOption {
  value: string;
  label: string;
}

interface ContractInfo {
  address: string;
  abi: any[]; // Consider defining a more specific type for ABI
  inheritedFunctions: Record<string, unknown>;
}

interface Contracts {
  [key: string]: {
    [contractName: string]: ContractInfo;
  };
}

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount(); // From base code
  const [address, setAddress] = useState('');
  const [isAddressEmpty, setIsAddressEmpty] = useState(true);
  const [isAddressTooShort, setIsAddressTooShort] = useState(false);
  const [isAbiInvalid, setIsAbiInvalid] = useState(false);
  const [network, setNetwork] = useState('mainnet');
  const [isContractLoaded, setIsContractLoaded] = useState(false);

  const options: ChainOption[] = Object.keys(viemChains).map(chain => ({ value: chain, label: chain }));

  const handleAbiChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const abi: any[] = JSON.parse(e.target.value); // Correctly parses the JSON string from the textarea
      setIsAbiInvalid(false); // If parsing succeeds, the ABI is valid
    } catch (error) {
      setIsAbiInvalid(true); // If parsing fails, the ABI is invalid
    }
  };

  const handleNetworkChange = (selectedNetwork: SingleValue<ChainOption>) => {
    const networkValue = selectedNetwork ? selectedNetwork.value : '';
    setNetwork(networkValue);
    if (selectedNetwork) {
      // Using type assertion
      updateTargetNetworks(selectedNetwork.value as "acala" | "ancient8" | "ancient8Sepolia" | "anvil" | "apexTestnet" | "arbitrum" | "arbitrumGoerli" | "arbitrumNova" | "astar" | "astarZkEVM" | "astarZkyoto" | "arbitrumSepolia" | "zoraTestnet");
    } else {
      // Handle the case where selectedNetwork is null
    }
};


  const handleReadWrite = async () => {
    if (!address) {
      setIsAddressEmpty(true);
      return;
    }
  
    if (!(viemChains as any)[network]) {
      console.error('Network not found in viemChains:', network);
      return;
    }
  
    type ABIElement = any;
    let abi: ABIElement[];
    try {
      const element = document.getElementById('contractABI');
      if (!(element instanceof HTMLInputElement)) {
        throw new Error('Element is not an HTMLInputElement');
      }
      const abiJson = element.value;
      abi = JSON.parse(abiJson);
    } catch (error) {
      console.error('Invalid ABI:', error);
      return;
    }
  
    // Prepare the contract update
    interface ContractInfo {
      address: string;
      abi: any[];
      inheritedFunctions: Record<string, unknown>;
    }

    interface NetworkContracts {
      [key: string]: {
        [contractName: string]: ContractInfo;
      };
    }
    
    const contractUpdate: NetworkContracts = {
      [viemChains[network as keyof typeof viemChains].id]: {
        YourContract: {
          address: address,
          abi: abi as any[], // Ensure this matches the expected type in ContractInfo
          inheritedFunctions: {} // Adjusted to an empty object to match Record<string, unknown> type
        }
      }
    };
    
    interface Contracts {
      [key: string]: {
        [contractName: string]: ContractInfo;
      };
    }
    
    const contracts: Contracts = {
      "1": {
        "YourContract": {
          "address": "0x0000000000000000000000000000000000000000",
          "abi": [],
          "inheritedFunctions": {}
        }
      }
    };
  
    // Check if contracts is not null and update it
    let updatedContracts;
    if (importedContracts(contracts as GenericContractsDeclaration, contracts as GenericContractsDeclaration)) {
      setContracts(contractUpdate);
    } else {
      console.error('Contracts variable is null');
    }
    setIsContractLoaded(true);
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Interact with</span>
            <span className="block text-4xl font-bold">EVM Smart Contract</span>
          </h1>
          <p className="text-center text-lg">
            Input your{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              smart contract address
            </code>{" "}
            and the designated{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              abi(application binary interface)
            </code>
          </p>
        </div>

        {/* Network Selector */}
        <label htmlFor="networkSelector">Select Network:</label>
        <Select
          id="networkSelector"
          defaultValue={options.find(option => option.value === 'mainnet')}
          options={options}
          onChange={selectedOption => handleNetworkChange(selectedOption.value)}
          styles={{
            control: (base) => ({
              ...base,
              width: 300,
              backgroundColor: '#f0f0f0', // Light gray, works on both dark and light backgrounds
              color: '#333', // Darker text color for contrast
            }),
            option: (styles) => ({
              ...styles,
              backgroundColor: '#f0f0f0', // Consistent with the control background
              color: '#333', // Ensuring readability
              ':hover': {
                backgroundColor: '#e2e2e2', // Slightly darker on hover for visual feedback
              }
            }),
            singleValue: (styles) => ({
              ...styles,
              color: '#333', // Ensuring readability
            }),
          }}
        />

        {/* Smart Contract Address Input */}
        <input 
          type="text" 
          placeholder=" Enter Smart Contract Address" 
          maxLength="42" 
          minLength="42" 
          style={{ width: '400px', borderRadius: '1.5rem' }}
          value={address} 
          onChange={e => {
            const address = e.target.value;
            setAddress(address);
            setIsAddressEmpty(!address);
            setIsAddressTooShort(address.length < 42);
          }} 
        />

        {/* Contract ABI Input */}
        <textarea 
          style={{ width: '500px', height: '300px', overflow: 'auto', borderRadius: '0.5rem' }}
          id="contractABI" 
          placeholder="  Enter Contract ABI (JSON format)" 
          onChange={handleAbiChange}
        />

<>
      <button 
        id="connectButton" 
        onClick={handleReadWrite}
        style={{
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
          width: '80px',
          height: '50px',
          backgroundColor: '#78909C',
          border: 'none'
        }}
        disabled={isAddressEmpty || isAddressTooShort || isAbiInvalid || isContractLoaded} // Disable the button when the contract is loaded
      >
        {isContractLoaded ? '✅' : 'Load Contract'}
      </button>
      {!isAddressEmpty && isAddressTooShort && <p style={{ color: 'red' }}>Address is too short!</p>}
      {isAddressEmpty && <p style={{ color: 'red' }}>Address is required!</p>}
      {isAbiInvalid && <p style={{ color: 'red' }}>Valid ABI is required!</p>}
    </>
   

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <PencilIcon className="h-8 w-8 fill-secondary" />
              <p>
                Read or write your smart contract using the{" "}
                <Link href="/readwrite" passHref className="link">
                  Read/Write
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

