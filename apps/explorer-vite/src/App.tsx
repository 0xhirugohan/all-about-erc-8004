import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const SEPOLIA_IDENTITY_REGISTRY_CONTRACT_ADDRESS = "0x8004a6090Cd10A7288092483047B097295Fb8847";

function App() {
  const [count, setCount] = useState(0);
  const [totalAgent, setTotalAgent] = useState(0);
  const [totalNonEmptyURIAgent, setTotalNonEmptyURIAgent] = useState(0);
  const [agentItems, setAgentItems] = useState([]);
  const [agentPagination, setAgentPagination] = useState();
  const [cursorHash, setCursorHash] = useState<string | null>();
  const [cursorDirection, setCursorDirection] = useState<"after" | "before" | null>();
  const [isFilterEmptyUriChecked, setIsFilterEmptyUriChecked] = useState(false);

  const fetchAgentIdentities = async () => {
    const response = await fetch(
      "http://localhost:42069/graphql",
      {
        method: "POST",
	headers: {
	  "Content-Type": "application/json"
	},
	body: JSON.stringify({
	  query: `
	    query {
	      agentIdentitys(
	        orderBy:"tokenId",
		limit:10,
		${cursorHash && cursorDirection ? `${cursorDirection}:"${cursorHash}",` : ""}
		${isFilterEmptyUriChecked ? `where: { tokenUri_not: ""},` : ""}
	      ) {
	        items {
		  chainId,
		  tokenId,
		  ownerAddress,
		  tokenUri,
		},
		pageInfo {
		  startCursor,
		  endCursor,
		  hasPreviousPage,
		  hasNextPage,
		},
		totalCount
	      }
	    }
	  `,
	})
      }
    );
    const json = await response.json();
    const {
      totalCount: totalAgentProps,
      items: agentItemsProps,
      pageInfo: agentPaginationProps
    } = json.data.agentIdentitys;

    setAgentItems(agentItemsProps);
    setAgentPagination(agentPaginationProps);
  }

  const fetchTotalAgents = async () => {
    const response = await fetch(
      "http://localhost:42069/graphql",
      {
        method: "POST",
	headers: {
	  "Content-Type": "application/json"
	},
	body: JSON.stringify({
	  query: `
	    query {
	      agentIdentitys {
		totalCount
	      }
	    }
	  `,
	})
      }
    );
    const json = await response.json();
    const { totalCount } = json.data.agentIdentitys;

    setTotalAgent(totalCount);
  }

  const fetchTotalNonEmptyURIAgents = async () => {
    const response = await fetch(
      "http://localhost:42069/graphql",
      {
        method: "POST",
	headers: {
	  "Content-Type": "application/json"
	},
	body: JSON.stringify({
	  query: `
	    query {
	      agentIdentitys (
	        where: { tokenUri_not: "" }
	      ) {
		totalCount
	      }
	    }
	  `,
	})
      }
    );
    const json = await response.json();
    const { totalCount } = json.data.agentIdentitys;

    setTotalNonEmptyURIAgent(totalCount);
  }

  useEffect(() => {
    fetchAgentIdentities();
    fetchTotalAgents();
    fetchTotalNonEmptyURIAgents();
  }, [cursorHash, cursorDirection, isFilterEmptyUriChecked]);

  const onPaginationClick = ({ hashProp, directionProp }) => {
    setCursorHash(hashProp);
    setCursorDirection(directionProp);
  }

  return (
    <div className="p-8 flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        <h1>Sepolia</h1>
        <p className="flex gap-x-2">
          Identity Registry Contract Address: 
	  <a
	    target="_blank"
	    href={`https://sepolia.etherscan.io/address/${SEPOLIA_IDENTITY_REGISTRY_CONTRACT_ADDRESS}`}
	  >
	    {SEPOLIA_IDENTITY_REGISTRY_CONTRACT_ADDRESS}
	  </a>
        </p>
        <p>Total Agents: {totalAgent}</p>
        <p>Total Agents with existing Token URI: {totalNonEmptyURIAgent}</p>
        <p>Unique Owner Addresses: {totalAgent}</p>
      </div>

      <label className="label">
        <input
	  type="checkbox"
	  checked={isFilterEmptyUriChecked ? "checked" : ""}
	  onClick={() => setIsFilterEmptyUriChecked(!isFilterEmptyUriChecked)}
	  className="checkbox"
	/>
	Hide empty URI
      </label>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
	  <thead>
	    <tr>
	      <th>Chain ID</th>
	      <th>Token ID</th>
	      <th>Owner</th>
	      <th>Token URI</th>
	    </tr>
	  </thead>
	  <tbody>
	  {
	    agentItems.map(
	      (item, index) => <tr>
		<td>{item.chainId}</td>
		<td>{item.tokenId}</td>
		<td>{item.ownerAddress}</td>
		<td>{item.tokenUri}</td>
	      </tr>
	    )
	  }
	  </tbody>
	</table>
      </div>

      <div className="mt-4 join grid grid-cols-2">
        <button
	  className={
	    `join-item btn btn-outline ${agentPagination?.hasPreviousPage ? "" : "btn-disabled"}`
	  }
	  onClick={
	    () => onPaginationClick({ hashProp: agentPagination?.startCursor, directionProp: 'before' })
	  }
	>
	  Previous
	</button>
        <button
	  className={
	    `join-item btn btn-outline ${agentPagination?.hasNextPage ? "" : "btn-disabled"}`
	  }
	  onClick={
	    () => onPaginationClick({ hashProp: agentPagination?.endCursor, directionProp: 'after' })
	  }
	>
	  Next
	</button>
      </div>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
