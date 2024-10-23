// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

contract TaskList {
  struct TaskItem {
    address owner;
    string task;
    bool isDone;
    bool isDeleted;
    uint256 order;
  }

  struct TaskRecord {
    uint256 index;
    TaskItem task;
  }

  TaskItem[] public tasks;

  event NewTask(TaskRecord task);
  event UpdatedTask(TaskRecord task);
  event CompletedTask(TaskRecord task);

  mapping(uint256 => address) taskToOwner;
  mapping(address => uint256) ownerTaskCount;

  modifier isOwner(uint256 _id) {
    require(msg.sender == taskToOwner[_id], "Task not owned by msg.sender.");
    _;
  }

  modifier isValidTask(string memory _task) {
    require(bytes(_task).length < 128, "Task length too long.");
    _;
  }

  constructor(){
    createTask(" ", false, false, 0);
  }

  function createTask(string memory _task, bool _isDone, bool _isDeleted, uint256 _order) private isValidTask(_task) returns (TaskItem memory) {
    address sender = msg.sender;
    if (tasks.length == 0){
      sender = address(0);
    }
    TaskItem memory task = TaskItem(sender, _task, _isDone, _isDeleted, _order);
    tasks.push(task);
    taskToOwner[tasks.length - 1] = sender;
    ownerTaskCount[sender]++;
    emit NewTask(TaskRecord(tasks.length - 1, task));
    return task;
  }

  function editTask(uint256 _id, string memory _task, bool _isDone, bool _isDeleted, uint256 _order) internal isValidTask(_task) isOwner(_id) {
    tasks[_id] = TaskItem(msg.sender, _task, _isDone, _isDeleted, _order);
    emit UpdatedTask(TaskRecord(_id, tasks[_id]));
  }

  function updateTasks(TaskRecord[] memory _tasks) external {
    for (uint i = 0; i < _tasks.length; i++) {
      uint index = _tasks[i].index;
      if (index == 0){
        createTask(_tasks[i].task.task, _tasks[i].task.isDone, _tasks[i].task.isDeleted, _tasks[i].task.order);
      } else {
        TaskItem memory task = _tasks[i].task;
        editTask(index, task.task, task.isDone, task.isDeleted, task.order);
      }
    }
  }

  function getTasksByOwner() external view returns (TaskRecord[] memory) {
    uint256 taskCount = 0;
    uint256 index = 1;
    TaskRecord[] memory ownerTaskRecords = new TaskRecord[](ownerTaskCount[msg.sender]);
    while (taskCount < ownerTaskCount[msg.sender]) {
      if (tasks[index].owner == msg.sender) {
        ownerTaskRecords[taskCount] = TaskRecord(index, tasks[index]);
        taskCount++;
      }
      index++;
    }
    return ownerTaskRecords;
  }
}