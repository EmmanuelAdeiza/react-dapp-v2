import { Col, Grid, Row, Text, styled } from '@nextui-org/react'
import { useCallback, useMemo, useState } from 'react'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import ModalStore from '@/store/ModalStore'
import { cosmosAddresses } from '@/utils/CosmosWalletUtil'
import { eip155Addresses } from '@/utils/EIP155WalletUtil'
import { polkadotAddresses } from '@/utils/PolkadotWalletUtil'
import { multiversxAddresses } from '@/utils/MultiversxWalletUtil'
import { tronAddresses } from '@/utils/TronWalletUtil'
import { tezosAddresses } from '@/utils/TezosWalletUtil'
import { solanaAddresses } from '@/utils/SolanaWalletUtil'
import { nearAddresses } from '@/utils/NearWalletUtil'
import { kadenaAddresses } from '@/utils/KadenaWalletUtil'
import { styledToast } from '@/utils/HelperUtil'
import { walletkit } from '@/utils/WalletConnectUtil'
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/data/EIP155Data'
import { COSMOS_MAINNET_CHAINS, COSMOS_SIGNING_METHODS } from '@/data/COSMOSData'
import { KADENA_CHAINS, KADENA_SIGNING_METHODS } from '@/data/KadenaData'
import { MULTIVERSX_CHAINS, MULTIVERSX_SIGNING_METHODS } from '@/data/MultiversxData'
import { NEAR_CHAINS, NEAR_SIGNING_METHODS } from '@/data/NEARData'
import { POLKADOT_CHAINS, POLKADOT_SIGNING_METHODS } from '@/data/PolkadotData'
import { SOLANA_CHAINS, SOLANA_SIGNING_METHODS } from '@/data/SolanaData'
import { TEZOS_CHAINS, TEZOS_SIGNING_METHODS } from '@/data/TezosData'
import { TRON_CHAINS, TRON_SIGNING_METHODS } from '@/data/TronData'
import ChainDataMini from '@/components/ChainDataMini'
import ChainAddressMini from '@/components/ChainAddressMini'
import { getChainData } from '@/data/chainsUtil'
import RequestModal from '../components/RequestModal'
import ChainSmartAddressMini from '@/components/ChainSmartAddressMini'
import { useSnapshot } from 'valtio'
import SettingsStore from '@/store/SettingsStore'
import usePriorityAccounts from '@/hooks/usePriorityAccounts'
import useSmartAccounts from '@/hooks/useSmartAccounts'
import { EIP5792_METHODS } from '@/data/EIP5792Data'
import { getWalletCapabilities } from '@/utils/EIP5792WalletUtil'
import { bip122Addresses, bip122Wallet } from '@/utils/Bip122WalletUtil'
import {
  BIP122_CHAINS,
  BIP122_EVENTS,
  BIP122_SIGNING_METHODS,
  IBip122ChainId
} from '@/data/Bip122Data'
import { EIP7715_METHOD } from '@/data/EIP7715Data'
import { useRouter } from 'next/router'
import { SUI_CHAINS, SUI_EVENTS, SUI_SIGNING_METHODS } from '@/data/SuiData'
import { suiAddresses } from '@/utils/SuiWalletUtil'
import { STACKS_CHAINS, STACKS_EVENTS, STACKS_SIGNING_METHODS } from '@/data/StacksData'
import { stacksAddresses, stacksWallet } from '@/utils/StacksWalletUtil'
import StacksLib from '@/lib/StacksLib'

const StyledText = styled(Text, {
  fontWeight: 400
} as any)

const StyledSpan = styled('span', {
  fontWeight: 400
} as any)

export default function SessionProposalModal() {
  const { smartAccountEnabled } = useSnapshot(SettingsStore.state)
  // Get proposal data and wallet address from store
  const data = useSnapshot(ModalStore.state)
  const proposal = data?.data?.proposal as SignClientTypes.EventArguments['session_proposal']
  const [isLoadingApprove, setIsLoadingApprove] = useState(false)
  const [isLoadingReject, setIsLoadingReject] = useState(false)
  const { getAvailableSmartAccountsOnNamespaceChains } = useSmartAccounts()

  const { query } = useRouter()

  const addressesToApprove = Number(query.addressesToApprove) || null

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155_CHAINS)
    const eip155Methods = Object.values(EIP155_SIGNING_METHODS)

    //eip5792
    const eip5792Chains = Object.keys(EIP155_CHAINS)
    const eip5792Methods = Object.values(EIP5792_METHODS)

    //eip7715
    const eip7715Chains = Object.keys(EIP155_CHAINS)
    const eip7715Methods = Object.values(EIP7715_METHOD)

    // cosmos
    const cosmosChains = Object.keys(COSMOS_MAINNET_CHAINS)
    const cosmosMethods = Object.values(COSMOS_SIGNING_METHODS)

    // Kadena
    const kadenaChains = Object.keys(KADENA_CHAINS)
    const kadenaMethods = Object.values(KADENA_SIGNING_METHODS)

    // multiversx
    const multiversxChains = Object.keys(MULTIVERSX_CHAINS)
    const multiversxMethods = Object.values(MULTIVERSX_SIGNING_METHODS)

    // near
    const nearChains = Object.keys(NEAR_CHAINS)
    const nearMethods = Object.values(NEAR_SIGNING_METHODS)

    // polkadot
    const polkadotChains = Object.keys(POLKADOT_CHAINS)
    const polkadotMethods = Object.values(POLKADOT_SIGNING_METHODS)

    // solana
    const solanaChains = Object.keys(SOLANA_CHAINS)
    const solanaMethods = Object.values(SOLANA_SIGNING_METHODS)

    // tezos
    const tezosChains = Object.keys(TEZOS_CHAINS)
    const tezosMethods = Object.values(TEZOS_SIGNING_METHODS)

    // tron
    const tronChains = Object.keys(TRON_CHAINS)
    const tronMethods = Object.values(TRON_SIGNING_METHODS)

    // bip122
    const bip122Chains = Object.keys(BIP122_CHAINS)
    const bip122Methods = Object.values(BIP122_SIGNING_METHODS)
    const bip122Events = Object.values(BIP122_EVENTS)

    // sui
    const suiChains = Object.keys(SUI_CHAINS)
    const suiMethods = Object.values(SUI_SIGNING_METHODS)
    const suiEvents = Object.values(SUI_EVENTS)

    // stacks
    const stacksChains = Object.keys(STACKS_CHAINS)
    const stacksMethods = Object.values(STACKS_SIGNING_METHODS)
    const stacksEvents = Object.values(STACKS_EVENTS)

    console.log('stacksAddresses', stacksAddresses)

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods.concat(eip5792Methods).concat(eip7715Methods),
        events: ['accountsChanged', 'chainChanged'],
        accounts: eip155Chains
          .map(chain =>
            eip155Addresses
              .map(account => `${chain}:${account}`)
              .slice(0, addressesToApprove ?? eip155Addresses.length)
          )
          .flat()
      },
      cosmos: {
        chains: cosmosChains,
        methods: cosmosMethods,
        events: [],
        accounts: cosmosChains
          .map(chain => cosmosAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      kadena: {
        chains: kadenaChains,
        methods: kadenaMethods,
        events: [],
        accounts: kadenaChains
          .map(chain => kadenaAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      mvx: {
        chains: multiversxChains,
        methods: multiversxMethods,
        events: [],
        accounts: multiversxChains
          .map(chain => multiversxAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      near: {
        chains: nearChains,
        methods: nearMethods,
        events: ['accountsChanged', 'chainChanged'],
        accounts: nearChains
          .map(chain => nearAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      polkadot: {
        chains: polkadotChains,
        methods: polkadotMethods,
        events: [],
        accounts: polkadotChains
          .map(chain => polkadotAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      solana: {
        chains: solanaChains,
        methods: solanaMethods,
        events: [],
        accounts: solanaChains
          .map(chain => solanaAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      tezos: {
        chains: tezosChains,
        methods: tezosMethods,
        events: [],
        accounts: tezosChains
          .map(chain => tezosAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      tron: {
        chains: tronChains,
        methods: tronMethods,
        events: [],
        accounts: tronChains
          .map(chain => tronAddresses.map(address => `${chain}:${address}`))
          .flat()
      },
      bip122: {
        chains: bip122Chains,
        methods: bip122Methods,
        events: bip122Events,
        accounts: bip122Addresses
      },

      sui: {
        chains: suiChains,
        methods: suiMethods,
        events: suiEvents,
        accounts: suiChains.map(chain => suiAddresses.map(address => `${chain}:${address}`)).flat()
      },
      stacks: {
        chains: stacksChains,
        methods: stacksMethods,
        events: stacksEvents,
        accounts: stacksAddresses
      }
    }
  }, [addressesToApprove])
  console.log('supportedNamespaces', supportedNamespaces, eip155Addresses)

  const requestedChains = useMemo(() => {
    if (!proposal) return []
    const required = []
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      required.push(chains)
    }

    const optional = []
    for (const [key, values] of Object.entries(proposal.params.optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      optional.push(chains)
    }
    console.log('requestedChains', [...new Set([...required.flat(), ...optional.flat()])])

    return [...new Set([...required.flat(), ...optional.flat()])]
  }, [proposal])

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () =>
      requestedChains
        .map(chain => {
          const chainData = getChainData(chain!)

          if (!chainData) return null

          return chainData
        })
        .filter(chain => chain), // removes null values
    [requestedChains]
  )

  // get required chains that are not supported by the wallet
  const notSupportedChains = useMemo(() => {
    if (!proposal) return []
    const required = []
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      required.push(chains)
    }
    return required
      .flat()
      .filter(
        chain =>
          !supportedChains
            .map(supportedChain => `${supportedChain?.namespace}:${supportedChain?.chainId}`)
            .includes(chain!)
      )
  }, [proposal, supportedChains])
  console.log('notSupportedChains', { notSupportedChains, supportedChains })
  const getAddress = useCallback((namespace?: string, chainId?: string) => {
    console.log('getAddress', namespace)
    if (!namespace) return 'N/A'
    switch (namespace) {
      case 'eip155':
        return eip155Addresses[0]
      case 'cosmos':
        return cosmosAddresses[0]
      case 'kadena':
        return kadenaAddresses[0]
      case 'mvx':
        return multiversxAddresses[0]
      case 'near':
        return nearAddresses[0]
      case 'polkadot':
        return polkadotAddresses[0]
      case 'solana':
        return solanaAddresses[0]
      case 'tezos':
        return tezosAddresses[0]
      case 'tron':
        return tronAddresses[0]
      case 'bip122':
        return bip122Addresses[0]
      case 'sui':
        return suiAddresses[0]
      case 'stacks':
        return stacksWallet.getAddress(`${namespace}:${chainId}`)
    }
  }, [])

  const namespaces = useMemo(() => {
    try {
      // the builder throws an exception if required namespaces are not supported
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces
      })

      return approvedNamespaces
    } catch (e) {
      console.error('Error building approved namespaces', e)
    }
  }, [proposal.params, supportedNamespaces])

  const reorderedEip155Accounts = usePriorityAccounts({ namespaces })
  console.log('Reordered accounts', { reorderedEip155Accounts })

  // Hanlde approve action, construct session namespace
  const onApprove = useCallback(async () => {
    console.log('onApprove', { proposal, namespaces })
    try {
      if (proposal && namespaces) {
        setIsLoadingApprove(true)
        if (reorderedEip155Accounts.length > 0) {
          // we should append the smart accounts to the available eip155 accounts
          namespaces.eip155.accounts = reorderedEip155Accounts.concat(namespaces.eip155.accounts)
        }
        //get capabilities for all reorderedEip155Accounts in wallet
        const capabilities = getWalletCapabilities(reorderedEip155Accounts)
        let sessionProperties = {
          capabilities: JSON.stringify(capabilities)
        } as any
        if (namespaces.bip122) {
          const bip122Chain = namespaces.bip122.chains?.[0]!
          sessionProperties.bip122_getAccountAddresses = JSON.stringify({
            payment: Array.from(bip122Wallet.getAddresses(bip122Chain as IBip122ChainId).values()),
            ordinal: Array.from(
              bip122Wallet.getAddresses(bip122Chain as IBip122ChainId, ['ordinal']).values()
            )
          })
        }
        console.log('sessionProperties', sessionProperties)
        await walletkit.approveSession({
          id: proposal.id,
          namespaces,
          sessionProperties
        })
        SettingsStore.setSessions(Object.values(walletkit.getActiveSessions()))
      }
    } catch (e) {
      styledToast((e as Error).message, 'error')
    } finally {
      setIsLoadingApprove(false)
      ModalStore.close()
    }
  }, [namespaces, proposal, reorderedEip155Accounts])

  // Hanlde reject action
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onReject = useCallback(async () => {
    if (proposal) {
      try {
        setIsLoadingReject(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        await walletkit.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS')
        })
      } catch (e) {
        setIsLoadingReject(false)
        styledToast((e as Error).message, 'error')
        return
      }
    }
    setIsLoadingReject(false)
    ModalStore.close()
  }, [proposal])
  console.log('notSupportedChains', notSupportedChains)
  console.log('supportedChains', supportedChains)
  return (
    <RequestModal
      metadata={proposal.params.proposer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
      infoBoxCondition={notSupportedChains.length > 0 || supportedChains.length === 0}
      disableApprove={notSupportedChains.length > 0 || supportedChains.length === 0}
      infoBoxText={`The session cannot be approved because the wallet does not the support some or all of the proposed chains. Please inspect the console for more information.`}
    >
      <Row>
        <Col>
          <StyledText h4>Requested permissions</StyledText>
        </Col>
      </Row>
      <Row>
        <Col>
          <DoneIcon style={{ verticalAlign: 'bottom' }} />{' '}
          <StyledSpan>View your balance and activity</StyledSpan>
        </Col>
      </Row>
      <Row>
        <Col>
          <DoneIcon style={{ verticalAlign: 'bottom' }} />{' '}
          <StyledSpan>Send approval requests</StyledSpan>
        </Col>
      </Row>
      <Row>
        <Col style={{ color: 'gray' }}>
          <CloseIcon style={{ verticalAlign: 'bottom' }} />
          <StyledSpan>Move funds without permission</StyledSpan>
        </Col>
      </Row>
      <Grid.Container style={{ marginBottom: '10px', marginTop: '10px' }} justify={'space-between'}>
        <Grid>
          <Row style={{ color: 'GrayText' }}>Accounts</Row>
          {(supportedChains.length > 0 &&
            supportedChains.map((chain, i) => {
              return (
                <Row key={i}>
                  <ChainAddressMini
                    key={i}
                    address={getAddress(chain?.namespace, chain?.chainId) || 'test'}
                  />
                </Row>
              )
            })) || <Row>Non available</Row>}

          <Row style={{ color: 'GrayText' }}>Smart Accounts</Row>
          {smartAccountEnabled &&
            namespaces &&
            getAvailableSmartAccountsOnNamespaceChains(namespaces?.eip155?.chains).map(
              (account, i) => {
                if (!account) {
                  return <></>
                }
                return (
                  <Row key={i}>
                    <ChainSmartAddressMini account={account} />
                  </Row>
                )
              }
            )}
        </Grid>
        <Grid>
          <Row style={{ color: 'GrayText' }} justify="flex-end">
            Chains
          </Row>
          {(supportedChains.length > 0 &&
            supportedChains.map((chain, i) => {
              console.log('chain', chain)
              if (!chain) {
                return <></>
              }

              return (
                <Row key={i}>
                  <ChainDataMini key={i} chainId={`${chain?.namespace}:${chain?.chainId}`} />
                </Row>
              )
            })) || <Row>Non available</Row>}
          <Row style={{ color: 'GrayText' }} justify="flex-end">
            Chains
          </Row>
          {smartAccountEnabled &&
            namespaces &&
            getAvailableSmartAccountsOnNamespaceChains(namespaces?.eip155?.chains).map(
              ({ chain }, i) => {
                if (!chain) {
                  return <></>
                }
                return (
                  <Row key={i} style={{ marginTop: '24px' }}>
                    <ChainDataMini key={i} chainId={`eip155:${chain.id}`} />
                  </Row>
                )
              }
            )}
        </Grid>
      </Grid.Container>
    </RequestModal>
  )
}
