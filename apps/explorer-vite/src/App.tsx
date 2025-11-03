import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import defaultAgentIcon from './assets/default-agent.svg'
import viteLogo from '/vite.svg'
import './App.css'

const SEPOLIA_IDENTITY_REGISTRY_CONTRACT_ADDRESS = "0x8004a6090Cd10A7288092483047B097295Fb8847";
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL!;
const SUBGRAPH_API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY!;

const ImageWithFallback = ({ src, fallbackSrc, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
};

function App() {
  const [count, setCount] = useState(0);
  const [totalAgent, setTotalAgent] = useState(0);
  const [totalNonEmptyURIAgent, setTotalNonEmptyURIAgent] = useState(0);
  const [agentItems, setAgentItems] = useState([]);
  const [agentPagination, setAgentPagination] = useState();
  const [cursorHash, setCursorHash] = useState<string | null>();
  const [cursorDirection, setCursorDirection] = useState<"after" | "before" | null>();
  const [isFilterEmptyUriChecked, setIsFilterEmptyUriChecked] = useState(false);

  const fetchAgentIdentitiesSubgraph = async () => {
    const response = await fetch(
      SUBGRAPH_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
	  "Authorization": "Bearer " + SUBGRAPH_API_KEY,
        },
        body: JSON.stringify({
          query: `
	    query {
	      agents(
	        first:20,
		${isFilterEmptyUriChecked ? `where: { agentURI_not:"" },`: ""}
	      ) {
	        id
	        chainId
	        agentId
	        agentURI
		owner
		registrationFile {
		  name
		  description
		  image
		}
	      }
	    }
	  `,
        }),
      }
    );
    const json = await response.json();
    const { agents: agentItemsProps } = json.data;
    setAgentItems(agentItemsProps);
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
    fetchTotalAgents();
    fetchTotalNonEmptyURIAgents();
    fetchAgentIdentitiesSubgraph();
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
	      <th>Image</th>
	      <th>Token ID</th>
	      <th>Name</th>
	      <th>Description</th>
	      <th>Owner</th>
	      <th>Token URI</th>
	      <th>Chain ID</th>
	    </tr>
	  </thead>
	  <tbody>
	  {
	    agentItems.map(
	      (item, index) => <tr key={item.id}>
	        <td>
		  <ImageWithFallback
		    src={item.registrationFile?.image ?? defaultAgentIcon}
		    fallbackSrc={defaultAgentIcon}
		    alt="agent image"
		  />
		</td>
		<td>{item.agentId}</td>
		<td>{item.registrationFile?.name}</td>
		<td>{item.registrationFile?.description}</td>
		<td>{item.owner}</td>
		<td>{item.agentURI}</td>
		<td>{item.chainId}</td>
	      </tr>
	    )
	  }
	  </tbody>
	</table>
      </div>

      <div className="mt-4 join grid grid-cols-2 gap-x-4">
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
    </div>
  )
}

export default App
