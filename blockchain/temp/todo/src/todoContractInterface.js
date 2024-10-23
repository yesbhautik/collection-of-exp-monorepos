const contractAddresses = {
  sepolia: "0x4afa107be41c4b3d3ce7ed0d84efac727135a4e5",
};

const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "string",
                name: "task",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isDone",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isDeleted",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "order",
                type: "uint256",
              },
            ],
            internalType: "struct TaskList.TaskItem",
            name: "task",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct TaskList.TaskRecord",
        name: "task",
        type: "tuple",
      },
    ],
    name: "CompletedTask",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "string",
                name: "task",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isDone",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isDeleted",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "order",
                type: "uint256",
              },
            ],
            internalType: "struct TaskList.TaskItem",
            name: "task",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct TaskList.TaskRecord",
        name: "task",
        type: "tuple",
      },
    ],
    name: "NewTask",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "string",
                name: "task",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isDone",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isDeleted",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "order",
                type: "uint256",
              },
            ],
            internalType: "struct TaskList.TaskItem",
            name: "task",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct TaskList.TaskRecord",
        name: "task",
        type: "tuple",
      },
    ],
    name: "UpdatedTask",
    type: "event",
  },
  {
    inputs: [],
    name: "getTasksByOwner",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "string",
                name: "task",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isDone",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isDeleted",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "order",
                type: "uint256",
              },
            ],
            internalType: "struct TaskList.TaskItem",
            name: "task",
            type: "tuple",
          },
        ],
        internalType: "struct TaskList.TaskRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tasks",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "task",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isDone",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isDeleted",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "order",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "string",
                name: "task",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isDone",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isDeleted",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "order",
                type: "uint256",
              },
            ],
            internalType: "struct TaskList.TaskItem",
            name: "task",
            type: "tuple",
          },
        ],
        internalType: "struct TaskList.TaskRecord[]",
        name: "_tasks",
        type: "tuple[]",
      },
    ],
    name: "updateTasks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export { contractAddresses, contractABI };
