'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';

import BlockumVaultABI from '@/constants/BlockumVaultABI.json';
import FGOLDistributionABI from '@/constants/FGOLDistributionABI.json';
import BlockumDAOABI from '@/constants/BlockumDAOABI.json';
import LPTokenABI from '@/constants/LPTokenABI.json';
import FGOLTokenABI from '@/constants/FGOLTokenABI.json';

export default function Home() {
  const initialValues = {
    depositValue: '',
    withdrawValue: '',
    distributeValue: '',
    title: '',
    description: '',
    presentationLink: '',
    proposalDetailsID: '',
    proposalDetailsIDForSetVotingParameters: '',
    proposalDetailsIDForRemove: '',
    totalMembersVotedForProposal: '',
    markProposalForReview: '',
    markProposalAsFunded: '',
    executeProposal: '',
    memberProgressForProposal: '',
    capitalProgressForProposal: '',
    days: '',
    hours: '',
    minutes: '',
  };
  const [values, setValues] = useState(initialValues);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [currentLPToken, setCurrentLPToken] = useState('');
  const [currentFGOLToken, setCurrentFGOLToken] = useState('');
  const [depositedLPToken, setDepositedLPToken] = useState('');
  const [isMemberOfAnyVault, setIsMemberOfAnyVault] = useState(false);
  const [totalBalanceOfAllVaults, setTotalBalanceOfAllVaults] = useState('');
  const [FGOLPendingClaim, setFGOLPendingClaim] = useState('');
  const [hasUserPaidFee, setHasUserPaidFee] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [totalMemberBalance, setTotalMemberBalance] = useState('');
  const [totalLPLockedInDAO, setTotalLPLockedInDAO] = useState('');
  const [totalMemberCountInDAO, setTotalMemberCountInDAO] = useState('');
  const [proposalDetails, setProposalDetails] = useState(null);
  const [totalMembersVotedForProposal, setTotalMembersVotedForProposal] =
    useState('');
  const [memberProgressForProposal, setMemberProgressForProposal] =
    useState('');
  const [capitalProgressForProposal, setCapitalProgressForProposal] =
    useState('');

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      'https://goerli.infura.io/v3/f8cb9f6a3a344ab98e87b6277730e063'
    )
  );
  const _web3 = new Web3(window.ethereum);

  const addressOfBlockumVault =
    '0x696dA2B5968f33F8C60e02F660e84B04709Da30b'.toLocaleLowerCase();
  const addressOfFGOLDistribution =
    '0xdAd37C0FB1A095bc9D237BB4A55F5FD6eab2B54e'.toLocaleLowerCase();
  const addressOfBlockumDAO =
    '0xF713C86d5e5560D5F69A1B1d1DA3E4d45e9c5F3a'.toLocaleLowerCase();
  const addressOfLPToken =
    '0x6007485F7329166d699824765554F4ca5baF5b58'.toLocaleLowerCase();
  const addressOfFGOLToken =
    '0x7Ab4CD9d41b7577198ac6aaD84E5f3F5C7EF1bd9'.toLocaleLowerCase();

  let BlockumVaultContract = new _web3.eth.Contract(
    BlockumVaultABI,
    addressOfBlockumVault
  );
  let FGOLDistributionContract = new _web3.eth.Contract(
    FGOLDistributionABI,
    addressOfFGOLDistribution
  );
  let BlockumDAOContract = new _web3.eth.Contract(
    BlockumDAOABI,
    addressOfBlockumDAO
  );
  let LPTokenContract = new _web3.eth.Contract(LPTokenABI, addressOfLPToken);
  let FGOLTokenContract = new _web3.eth.Contract(
    FGOLTokenABI,
    addressOfFGOLToken
  );

  loadVaultData();

  useEffect(() => {
    if (window.ethereum) {
      if (window.ethereum._state.isUnlocked) {
        setIsConnected(true);
        connectMetaMask();
      } else {
        setIsConnected(false);
      }
    } else {
      window.alert('Please install MetaMask');
      window.open('https://metamask.io/download.html', '_self');
    }
  }, [isConnected]);

  async function connectMetaMask() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const walletAccount = await _web3.eth.getAccounts();

    // Get balance of ETH
    const balanceWei = await _web3.eth.getBalance(walletAccount[0]);
    const balanceEth = _web3.utils.fromWei(balanceWei, 'ether');

    // Get balance of LP token
    const lpTokenWei = await LPTokenContract.methods
      .balanceOf(walletAccount[0])
      .call();
    const lpTokenEth = _web3.utils.fromWei(lpTokenWei, 'ether');

    // Get balance of LP token
    const FGOLTokenWei = await FGOLTokenContract.methods
      .balanceOf(walletAccount[0])
      .call();
    const FGOLTokenEth = _web3.utils.fromWei(FGOLTokenWei, 'ether');

    setAccount(walletAccount[0]);
    setBalance(balanceEth);
    setCurrentLPToken(lpTokenEth);
    setCurrentFGOLToken(FGOLTokenEth);
  }

  const handleConnectClick = async () => {
    await connectMetaMask();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleDepositClick = async () => {
    try {
      const depositValueWei = _web3.utils.toWei(values.depositValue, 'ether');
      await LPTokenContract.methods
        .approve(addressOfBlockumVault, depositValueWei)
        .send({ from: account });
      alert(`Deposit of ${values.depositValue} LP tokens approved!`);
      const tx = await BlockumVaultContract.methods
        .deposit(depositValueWei)
        .send({
          from: account,
        });
      alert(`Deposit of ${values.depositValue} LP tokens complete!`);
      setValues({ depositValue: '' });
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const handleWithdrawClick = async () => {
    try {
      const withdrawValueWei = _web3.utils.toWei(values.withdrawValue, 'ether');
      const tx = await BlockumVaultContract.methods
        .withdraw(withdrawValueWei)
        .send({
          from: account,
        });
      alert(`Withdraw of ${values.withdrawValue} LP tokens complete!`);
      setValues({ withdrawValue: '' });
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDistributeClick = async () => {
    try {
      const distributeValueWei = _web3.utils.toWei(
        values.distributeValue,
        'ether'
      );
      console.log(distributeValueWei);
      await FGOLTokenContract.methods
        .approve(addressOfFGOLDistribution, distributeValueWei)
        .send({ from: account });
      const tx = await FGOLDistributionContract.methods
        .allocateForDistribution(distributeValueWei)
        .send({
          from: account,
        });
      alert(`Distribution of ${values.distributeValue} FGOL tokens initiated!`);
      setValues({ distributeValue: '' });
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetFGOLPendingClaim = async () => {
    try {
      const FGOLPending = await FGOLDistributionContract.methods
        .getFGOLPendingClaim()
        .call();
      console.log(FGOLPending);
      setFGOLPendingClaim(_web3.utils.fromWei(FGOLPending, 'ether'));
    } catch (error) {
      console.log(error);
    }
  };

  const handleClaim = async () => {
    try {
      await FGOLDistributionContract.methods.claim().send({
        from: account,
      });
      alert('Claim successful!');
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetTotalBalanceOfAllVaults = async () => {
    try {
      const totalBalanceWei = await FGOLDistributionContract.methods
        .getTotalBalanceOfAllVaults()
        .call();
      console.log(totalBalanceWei);
      const totalBalanceEth = _web3.utils.fromWei(totalBalanceWei, 'ether');
      setTotalBalanceOfAllVaults(totalBalanceEth);
      console.log(totalBalanceOfAllVaults);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayProposalFee = async () => {
    try {
      await FGOLDistributionContract.methods.payProposalFee().send({
        from: account,
      });
      alert('Proposal fee paid!');
    } catch (error) {
      console.log(error);
    }
  };

  const handleHasUserPaidFee = async () => {
    try {
      const hasUserPaidFee_ = await FGOLDistributionContract.methods
        .hasUserPaidFee(account)
        .call();
      alert('Has user');
      setHasUserPaidFee(hasUserPaidFee_);
      console.log(hasUserPaidFee);
    } catch (error) {
      console.log(error);
    }
  };

  const handleResetProposalFeeStatus = async () => {
    try {
      const tx = await FGOLDistributionContract.methods
        .resetProposalFeeStatus(account)
        .send({
          from: account,
        });
      console.log(tx);
      alert('Reset proposal fee status!');
    } catch (error) {
      console.log(error);
    }
  };

  const handleIsMember = async () => {
    try {
      const isMember_ = await BlockumDAOContract.methods
        .isMember(account)
        .call();
      if (isMember_) {
        alert('You are a member!');
      } else {
        alert('You are not a member!');
      }
      setIsMember(isMember_);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTotalMemberBalance = async () => {
    try {
      const totalMemberBalanceWei = await BlockumDAOContract.methods
        .totalMemberBalance(account)
        .call();
      const totalMemberBalanceEth = _web3.utils.fromWei(
        totalMemberBalanceWei,
        'ether'
      );
      setTotalMemberBalance(totalMemberBalanceEth);
      alert(`Total member balance: ${totalMemberBalanceEth}`);
      console.log(totalMemberBalanceEth);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTotalLPLockedInDAO = async () => {
    try {
      const totalLPLockedInDAOWei = await BlockumDAOContract.methods
        .totalLPLockedInDAO()
        .call();
      const totalLPLockedInDAOEth = _web3.utils.fromWei(
        totalLPLockedInDAOWei,
        'ether'
      );
      setTotalLPLockedInDAO(totalLPLockedInDAOEth);
      alert(`Total LP tokens locked in DAO: ${totalLPLockedInDAOEth}`);
      console.log(totalLPLockedInDAOEth);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetTotalMemberCountInDAO = async () => {
    try {
      const totalMemberCountInDAO_ = await BlockumDAOContract.methods
        .getTotalMemberCountInDAO()
        .call();
      setTotalMemberCountInDAO(totalMemberCountInDAO_);
      alert(`Total member count in DAO: ${totalMemberCountInDAO_}`);
      console.log(totalMemberCountInDAO_);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateProposal = async () => {
    try {
      const tx = await BlockumDAOContract.methods
        .createProposal(
          values.title,
          values.description,
          values.presentationLink
        )
        .send({ from: account });
      console.log(tx);
      alert('Proposal created!');
      setValues({ title: '', description: '', presentationLink: '' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetProposalDetails = async () => {
    try {
      const proposalDetails_ = await BlockumDAOContract.methods
        .proposalDetails(values.proposalDetailsID)
        .call();
      setProposalDetails(proposalDetails_);
      console.log(proposalDetails_);
    } catch (error) {
      alert(error);
      setProposalDetails(null);
      console.log(error);
    }
  };

  const handleSetVotingParametersForProposal = async () => {
    try {
      await BlockumDAOContract.methods
        .setVotingParametersForProposal(
          values.proposalDetailsID,
          values.days,
          values.hours,
          values.minutes
        )
        .send({
          from: account,
        });
      alert('Voting parameters set!');
      setValues({ proposalDetailsID: '', days: '', hours: '', minutes: '' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveProposal = async () => {
    try {
      await BlockumDAOContract.methods
        .removeProposal(values.proposalDetailsIDForRemove)
        .send({ from: account });
      alert(
        `Proposal with ID of ${values.proposalDetailsIDForRemove} has been removed.`
      );
      setValues({ proposalDetailsIDForRemove: '' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleForVote = async () => {
    try {
      await BlockumDAOContract.methods
        .vote(values.proposalDetailsID, true)
        .send({
          from: account,
        });
      alert('Vote casted!');
      setValues({ proposalDetailsID: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleAgainstVote = async () => {
    try {
      await BlockumDAOContract.methods
        .vote(values.proposalDetailsID, false)
        .send({
          from: account,
        });
      alert('Vote casted!');
      setValues({ proposalDetailsID: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleGetTotalMembersVotedForProposal = async () => {
    try {
      const totalMembersVoted = await BlockumDAOContract.methods
        .getTotalMembersVotedForProposal(values.totalMembersVotedForProposal)
        .call();
      alert(`Total members voted: ${totalMembersVoted}`);
      setTotalMembersVotedForProposal(totalMembersVoted);
      console.log(totalMembersVotedForProposal);
      setValues({ totalMembersVotedForProposal: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleMarkProposalForReview = async () => {
    try {
      await BlockumDAOContract.methods
        .markProposalForReview(values.markProposalForReview)
        .send({
          from: account,
        });
      alert('Proposal marked for review!');
      setValues({ markProposalForReview: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleMarkProposalAsFunded = async () => {
    try {
      await BlockumDAOContract.methods
        .markProposalAsFunded(values.markProposalAsFunded)
        .send({
          from: account,
        });
      alert('Proposal marked as funded!');
      setValues({ markProposalAsFunded: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleExecuteProposal = async () => {
    try {
      await BlockumDAOContract.methods
        .executeProposal(values.executeProposal)
        .send({
          from: account,
        });
      alert('Proposal executed!');
      setValues({ executeProposal: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleGetMemberProgressForProposal = async () => {
    try {
      const memberProgressForProposal_ = await BlockumDAOContract.methods
        .getMemberProgressForProposal(values.memberProgressForProposal)
        .call();
      alert(`Member progress: ${memberProgressForProposal_}`);
      setMemberProgressForProposal(memberProgressForProposal_);
      console.log(memberProgressForProposal);
      setValues({ memberProgressForProposal: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };
  const handleGetCapitalProgressForProposal = async () => {
    try {
      const capitalProgressForProposal_ = await BlockumDAOContract.methods
        .getCapitalProgressForProposal(values.capitalProgressForProposal)
        .call();
      alert(`Capital progress: ${capitalProgressForProposal_}`);
      setCapitalProgressForProposal(capitalProgressForProposal_);
      console.log(capitalProgressForProposal);
      setValues({ capitalProgressForProposal: '' });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleGetCurrentMemberQuorum = async () => {
    try {
      const currentMember = await BlockumDAOContract.methods.getCurrentMemberQuorum().call();
      alert(`Current member quorum: ${currentMember}`);
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const handleGetCurrentCapitalQuorum = async () => {
    try {
      const currentCapital = await BlockumDAOContract.methods
        .getCurrentCapitalQuorum()
        .call();
      alert(`Current capital quorum: ${currentCapital}`);
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  async function loadVaultData() {
    try {
      const depositLPToken = await BlockumVaultContract.methods
        .getMemberBalance(account)
        .call();
      const isMember = await FGOLDistributionContract.methods
        .isMemberOfAnyVault(account)
        .call();
      setDepositedLPToken(_web3.utils.fromWei(depositLPToken, 'ether'));
      setIsMemberOfAnyVault(isMember);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className="px-24 py-12 min-h-screen">
      <div className="flex items-center justify-end">
        {account ? (
          <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            {account}
          </p>
        ) : (
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={handleConnectClick}
          >
            Connect
          </button>
        )}
      </div>
      <div>
        <p>ETH Balance: {balance}</p>
        <br />
        <p>LPToken Balance: {currentLPToken}</p>
        <br />
        <p>FGOLToken Balance: {currentFGOLToken}</p>
      </div>
      <div className="pt-5">
        <h1 className="text-2xl font-bold">BlockumVault</h1>
        <div className="py-3 flex flex-row gap-3">
          <input
            className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
            type="text"
            placeholder="Amount you want to deposit."
            name="depositValue"
            onChange={handleInputChange}
            value={values.depositValue}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={handleDepositClick}
          >
            Deposit
          </button>
          <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            Current Amount of LP Tokens: {depositedLPToken.toString()}
          </p>
        </div>
      </div>
      <div>
        <div className="py-3 flex flex-row gap-3">
          <input
            className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
            type="text"
            placeholder="Amount you want to withdraw."
            name="withdrawValue"
            onChange={handleInputChange}
            value={values.withdrawValue}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={handleWithdrawClick}
          >
            Withdraw
          </button>
        </div>
      </div>
      <div className="pt-5">
        <h1 className="text-2xl font-bold">FGOLDistribution</h1>
        {isMemberOfAnyVault ? (
          <h3>You are member of any vault</h3>
        ) : (
          <h3>You are not member of any vault</h3>
        )}
        <div className="py-3 grid grid-cols-12 justify-start items-center gap-3">
          <div className="col-span-12 flex flex-row gap-3">
            <input
              className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
              type="text"
              placeholder="Amount you want to distribute."
              name="distributeValue"
              onChange={handleInputChange}
              value={values.distributeValue}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handleDistributeClick}
            >
              Distribute FGOL Token
            </button>
            {totalBalanceOfAllVaults == '' ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetTotalBalanceOfAllVaults}
              >
                Get Total Balance Of All Vaults
              </button>
            ) : (
              <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                Total Balance Of All Vaults: {totalBalanceOfAllVaults}
              </p>
            )}
            {FGOLPendingClaim == '' ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetFGOLPendingClaim}
              >
                Get FGOL Pending Claim
              </button>
            ) : (
              <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                FGOL Pending Claim: {FGOLPendingClaim}
              </p>
            )}
          </div>
          <div className="col-span-12 flex flex-row gap-3">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handleClaim}
            >
              Claim
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handlePayProposalFee}
            >
              PayProposalFee
            </button>
            {hasUserPaidFee == false ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleHasUserPaidFee}
              >
                Has User Paid Fee
              </button>
            ) : (
              <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                HasUserPaidFee: Yes
              </p>
            )}
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handleResetProposalFeeStatus}
            >
              ResetProposalFeeStatus
            </button>
          </div>
        </div>
        <div className="pt-5">
          <h1 className="text-2xl font-bold">BlockumDAO</h1>
          <div className="mt-5 flex flex-row gap-3">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handleIsMember}
            >
              Am I member?
            </button>
            {totalMemberBalance == '' ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleTotalMemberBalance}
              >
                TotalMemberBalance
              </button>
            ) : (
              <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-auto">
                TotalMemberBalance: {totalMemberBalance}
              </p>
            )}
            {totalLPLockedInDAO == '' ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleTotalLPLockedInDAO}
              >
                TotalLPLockedInDAO
              </button>
            ) : (
              <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-auto">
                TotalLPLockedInDAO: {totalLPLockedInDAO}
              </p>
            )}
            {totalMemberCountInDAO == 0 ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetTotalMemberCountInDAO}
              >
                GetTotalMemberCountInDAO
              </button>
            ) : (
              <p className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-auto">
                TotalMemberCountInDAO: {totalMemberCountInDAO.toString()}
              </p>
            )}
          </div>
          <div>
            <div>
              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium leading-6"
                      >
                        Title
                      </label>
                      <div className="mt-2">
                        <div className="flex rounded-md shadow-sm sm:max-w-md">
                          <input
                            type="text"
                            name="title"
                            id="title"
                            className="bg-white text-gray-700 border w-96 border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                            placeholder="Title here"
                            onChange={handleInputChange}
                            value={values.title}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium leading-6"
                      >
                        Description
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          name="description"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                          defaultValue={''}
                          onChange={handleInputChange}
                          value={values.description}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="presentationLink"
                        className="block text-sm font-medium leading-6"
                      >
                        PresentationLink
                      </label>
                      <div className="mt-2">
                        <div className="flex rounded-md shadow-sm sm:max-w-md">
                          <input
                            type="url"
                            name="presentationLink"
                            id="presentationLink"
                            className="bg-white text-gray-700 border w-96 border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                            placeholder="PresentationLink here"
                            onChange={handleInputChange}
                            value={values.presentationLink}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button type="button" className="font-medium py-2 px-4 rounded">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  onClick={handleCreateProposal}
                >
                  CreateProposal
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-start gap-3">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID you want to get details."
                name="proposalDetailsID"
                onChange={handleInputChange}
                value={values.proposalDetailsID}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetProposalDetails}
              >
                GetProposalDetails
              </button>
            </div>
            <div className="mt-3 flex flex-row gap-3">
              {proposalDetails == null ? (
                <div></div>
              ) : (
                <div>
                  <div className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-auto">
                    <p>Proposer: {proposalDetails.proposer}</p>
                    <p>Title: {proposalDetails.title}</p>
                    <p>Description: {proposalDetails.description}</p>
                    <p>PresentationLink: {proposalDetails.presentationLink}</p>
                    <p>EndTime: {proposalDetails.endTime.toString()}</p>
                    <p>
                      ParametersSet: {proposalDetails.parametersSet.toString()}
                    </p>
                  </div>
                  <aside class="flex items-center mt-3">
                    <button
                      class="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                      onClick={handleForVote}
                    >
                      <svg
                        class="w-3.5 h-3.5 me-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 18"
                      >
                        <path d="M3 7H1a1 1 0 0 0-1 1v8a2 2 0 0 0 4 0V8a1 1 0 0 0-1-1Zm12.954 0H12l1.558-4.5a1.778 1.778 0 0 0-3.331-1.06A24.859 24.859 0 0 1 6 6.8v9.586h.114C8.223 16.969 11.015 18 13.6 18c1.4 0 1.592-.526 1.88-1.317l2.354-7A2 2 0 0 0 15.954 7Z" />
                      </svg>
                    </button>
                    <button
                      class="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500 group ms-5"
                      onClick={handleAgainstVote}
                    >
                      <svg
                        class="w-3.5 h-3.5 me-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 18"
                      >
                        <path d="M11.955 2.117h-.114C9.732 1.535 6.941.5 4.356.5c-1.4 0-1.592.526-1.879 1.316l-2.355 7A2 2 0 0 0 2 11.5h3.956L4.4 16a1.779 1.779 0 0 0 3.332 1.061 24.8 24.8 0 0 1 4.226-5.36l-.003-9.584ZM15 11h2a1 1 0 0 0 1-1V2a2 2 0 1 0-4 0v8a1 1 0 0 0 1 1Z" />
                      </svg>
                    </button>
                  </aside>
                </div>
              )}
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded w-30"
                type="text"
                placeholder="Proposal ID"
                name="proposalDetailsIDForSetVotingParameters"
                onChange={handleInputChange}
                value={values.proposalDetailsIDForSetVotingParameters}
              />
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded w-20"
                type="text"
                placeholder="Days"
                name="days"
                onChange={handleInputChange}
                value={values.days}
              />
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded w-20"
                type="text"
                placeholder="Hours"
                name="hours"
                onChange={handleInputChange}
                value={values.hours}
              />
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded w-20"
                type="text"
                placeholder="Minuetes"
                name="minutes"
                onChange={handleInputChange}
                value={values.minutes}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleSetVotingParametersForProposal}
              >
                setVotingParametersForProposal
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID you want to get details."
                name="proposalDetailsIDForRemove"
                onChange={handleInputChange}
                value={values.proposalDetailsIDForRemove}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleRemoveProposal}
              >
                RemoveProposal
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID"
                name="totalMembersVotedForProposal"
                onChange={handleInputChange}
                value={values.totalMembersVotedForProposal}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetTotalMembersVotedForProposal}
              >
                GetTotalMembersVotedForProposal
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID"
                name="markProposalForReview"
                onChange={handleInputChange}
                value={values.markProposalForReview}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleMarkProposalForReview}
              >
                MarkProposalForReview
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID"
                name="markProposalAsFunded"
                onChange={handleInputChange}
                value={values.markProposalAsFunded}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleMarkProposalAsFunded}
              >
                MarkProposalAsFunded
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID"
                name="executeProposal"
                onChange={handleInputChange}
                value={values.executeProposal}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleExecuteProposal}
              >
                ExecuteProposal
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID"
                name="memberProgressForProposal"
                onChange={handleInputChange}
                value={values.memberProgressForProposal}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetMemberProgressForProposal}
              >
                GetMemberProgressForProposal
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row items-center justify-start gap-3">
              <input
                className="bg-white text-gray-700 border border-blue-500 outline-blue-600 font-medium py-2 px-4 rounded"
                type="text"
                placeholder="Proposal ID"
                name="capitalProgressForProposal"
                onChange={handleInputChange}
                value={values.capitalProgressForProposal}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleGetCapitalProgressForProposal}
              >
                GetCapitalProgressForProposal
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-row items-center justify-start gap-3">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handleGetCurrentMemberQuorum}
            >
              GetCurrentMemberQuorum
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={handleGetCurrentCapitalQuorum}
            >
              GetCurrentCapitalQuorum
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
