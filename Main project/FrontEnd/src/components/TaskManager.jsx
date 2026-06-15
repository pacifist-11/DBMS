import React, { useEffect, useRef, useState } from 'react';
import './TaskManager.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi } from '../lib';

const TaskManager = ({logout}) => {
    const contentDiv = useRef();
    const tsktitle = useRef();
    const [isProgress, setIsProgress] = useState(false);
    const [data, setData] = useState(null);
    const [token, setToken] = useState("");
    const [activePage, setActivePage] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [taskData, setTaskData] = useState(null);
    const [errorData, setErrorData] = useState(null);

    const [showDropdown, setShowDropdown] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchvalue, setSearchValue] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1);

    useEffect(()=>{
        const storedtoken = localStorage.getItem("token");
        if(storedtoken == undefined || storedtoken == "")
            return logout();

        const ps = Math.floor((contentDiv.current.offsetHeight - 40) / 40);
        setToken(storedtoken);
        setIsProgress(false);
    },[]);

    function addTask(){
        setIsProgress(true);
        setErrorData(null);
        setTaskData({
            id: "",
            title: "",
            description: "",
            createdby: 0,
            assignedto: "",
            priority: 0,
            deadline: "",
            status: 0,
        });
        setSearchValue("");
        setOptions([]);
        setShowPopup(true);
        setTimeout(() => {tsktitle.current?.focus();}, 0);
        setIsProgress(false);
    }

    function handleInput(e){
        const {name, value} = e.target;
        setTaskData({...taskData, [name] : value});
    }

    function searchUser(e){
        const {value} = e.target;
        setSearchValue(value);
        if(value.length === 0){
            setOptions([]);
            setTaskData({...taskData, ['assignedto']: ""});
            setShowDropdown(false);
            return;
        }
        if(value.length % 2 === 0)
            callApi("GET", apibaseurl + "/authservice/searchuser/" + value, null, null, searchUserResponse, token);                   
    }

    function searchUserResponse(res){
        setHighlightIndex(-1);
        setOptions(res.users);
        setShowDropdown(res.users.length > 0);
    }

    function selectUser(user){
        setSearchValue(user.fullname + " (" + user.email + ")");
        setTaskData({...taskData, ['assignedto']:user.id});
        setShowDropdown(false);
    }

    function completeSearchUser(e){
        setShowDropdown(false);
        if(options.length === 0)
            return;

        const index = highlightIndex >= 0 ? highlightIndex : 0;
        const user = options[index];

        setSearchValue(user.fullname + " (" + user.email + ")");
        setTaskData({...taskData, ['assignedto']:user.id});
    }

    function handleKeyDown(e) {
        if (!showDropdown || options.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex(highlightIndex => highlightIndex < options.length - 1 ? highlightIndex + 1 : 0);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex(highlightIndex => highlightIndex > 0 ? highlightIndex - 1 : options.length - 1);
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0) 
                selectUser(options[highlightIndex]);
        }
    }

    function validateData(){
        let errors = {};
        if(taskData?.title === "") errors.title = true;
        if(taskData?.description === "") errors.description = true;
        if(searchvalue === "") errors.assignedto = true;
        if(taskData?.priority === "") errors.priority = true;
        if(taskData?.deadline === "") errors.deadline = true;
        if(taskData?.status === "") errors.status = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function saveTask(){
        if(validateData())
            return;

        setIsProgress(true);
        if(taskData?.id === "")
            callApi("POST", apibaseurl + "/taskservice/createtask", taskData, null, saveTaskHandler, token);
        else
            callApi("PUT", apibaseurl + "/taskservice/updatetask/" + taskData?.id, taskData, null, saveTaskHandler, token);
    }

    function saveTaskHandler(res){
        alert(res.message);
        setIsProgress(false);
        if(res.code !== 200)      
            return;

        setShowPopup(false);
        setTaskData(null);
        //loadUsers(activePage + 1);
    }

    return (
        <div className='tmanager'>
            <div className='tmanager-header'>
                <label>Task Manager</label>
            </div>
            <div className='tmanager-content' ref={contentDiv}>
                <table>
                    <thead>
                        <tr>
                            <th style={{'width':'50px'}}>S#</th>
                            <th style={{'width':'350px'}}>Title</th>
                            <th style={{'width':'150px'}}>Assigned To</th>
                            <th style={{'width':'100px'}}>Priority</th>
                            <th style={{'width':'100px'}}>Deadline</th>
                            <th style={{'width':'100px'}}>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                </table>
                <h2>You can now create and save new tasks by click on the Add New button and check with MongoDB</h2>
                <p style={{'color':'red','font-style':'italic'}}>Note: The task list view is currently under development and will be available in the next version.</p>
                
            </div>
            <div className='tmanager-footer'>
                <button onClick={()=>addTask()}>Add New</button>
                <div className='pages'>{
                    // Array.from({ length: data?.totalpages}, (_, index) => (
                    //     <label key={index} className={index == activePage? 'active': ''} onClick={()=>loadUsers(index + 1)}>
                    //         {index + 1}
                    //     </label>
                    // ))
                }</div>
            </div>

            {showPopup && 
                <div className='overlay'>
                    <div className='popup'>
                        <span className='close' onClick={()=>setShowPopup(false)}>&times;</span>
                        <h3>{taskData?.id == "" ? "New Task" : "Update Task"}</h3>
                        <label>Task Title*</label>
                        <input type='text' ref={tsktitle} className={errorData?.title ? 'error' : ''} autoComplete='off' name='title' value={taskData?.title} onChange={(e)=>handleInput(e)} />
                        <label>Description*</label>
                        <textarea rows="2" className={errorData?.description ? 'error' : ''} name='description' value={taskData?.description} onChange={(e)=>handleInput(e)}></textarea>
                        <label>Assigned To*</label>
                        <div className="dropdown">
                            <input type="text" autoComplete="off" className={errorData?.assignedto ? 'error' : ''} name='assignedto' value={searchvalue} onChange={(e)=>searchUser(e)}  onBlur={(e)=>completeSearchUser(e)} onKeyDown={(e)=>handleKeyDown(e)} />
                            {showDropdown && 
                                <ul>
                                    {options.map((item, index) => (
                                        <li key={item.id} className={highlightIndex === index ? "active" : ""} onMouseDown={() => selectUser(item)}>{item.fullname} ({item.email})</li>
                                    ))}
                                </ul>
                            }
                        </div>
                        <label>Priority*</label>
                        <select className={errorData?.priority ? 'error' : ''} name='priority' value={taskData?.priority} onChange={(e)=>handleInput(e)}>
                            <option value={0}>Normal</option>
                            <option value={1}>High</option>
                        </select>
                        <label>Deadline (mm/dd/yyyy)*</label>
                        <input type='date' style={{"height": "33px"}} className={errorData?.deadline ? 'error' : ''} autoComplete='off' name='deadline' value={taskData?.deadline} onChange={(e)=>handleInput(e)} />
                        <label>Task Status*</label>
                        <select className={errorData?.status ? 'error' : ''} name='status' value={taskData?.status} onChange={(e)=>handleInput(e)}>
                            <option value={0}>Assigned</option>
                            <option value={1}>In-Progress</option>
                            <option value={2}>Completed</option>
                        </select>
                        <button onClick={()=>saveTask()}>{taskData?.id == "" ? "Save" : "Update"}</button>
                    </div>
                </div>
            }

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default TaskManager;
