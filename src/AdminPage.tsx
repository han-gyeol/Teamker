import * as React from 'react';

import UserDetails from "./UserDetails";
import LoaderPage from "./LoaderPage";
import * as Utilities from "./Utilities";

interface AdminPageProps {
    index: number;
    groupList: Utilities.Group[];
}

interface AdminPageStates {
    selectIndex: number;
    numOfInputs: number;
    matchMostSimilar: boolean;
    shouldUserDetailsOpen: boolean;
}

export default class AdminPage extends React.Component<AdminPageProps, AdminPageStates> {
    initialiseStatus: number = -1; // -1 for not initialised, 0 for initialising, 1 for initialised
    isNewGroup: boolean = false;
    usersOnTeamker: Utilities.User[] = [];
    usersNotOnTeamker: Utilities.User[] = [];
    userDetailIndex: number = -1;

    constructor(props: AdminPageProps) {
        super(props);

        this.state = ({
            selectIndex: this.props.index,
            numOfInputs: 3,
            matchMostSimilar: false,
            shouldUserDetailsOpen: false
        });
    }

    fetchGroupMembers(index: number): void {
        let groupId = this.props.groupList[index].id;
        Promise.all([Utilities.getGroupMembersOnTeamker(groupId), Utilities.getGroupMembersNotOnTeamker(groupId)])
            .then(function (res: any) {
                this.usersOnTeamker = res[0];
                this.usersNotOnTeamker = res[1];
                this.initialiseStatus = 1;
                this.forceUpdate();
            }.bind(this));
    }

    fetchGroupStatus(index: number): void {
        this.initialiseStatus = 0;
        let groupId = this.props.groupList[index].id;

        Utilities.checkIsNewGroup(groupId)
            .then(function (isNewGroup: boolean) {
                console.log("isNewGroup: " + isNewGroup);
                this.isNewGroup = isNewGroup;
                if (isNewGroup) {
                    this.usersOnTeamker = [];
                    this.usersNotOnTeamker = [];
                    this.initialiseStatus = 1;
                    this.forceUpdate();
                } else {
                    this.fetchGroupMembers(index);
                }
            }.bind(this));
    }

    getMessageStyle(): string {
        if (this.isNewGroup) {
            return "MessageHighlight";
        } else {
            return "Message"
        }
    }

    getButtonStyle(): string {
        if (this.isNewGroup) {
            return "Button";
        } else {
            return "ButtonHighlight";
        }
    }

    getMessage(): string {
        if (this.isNewGroup) {
            return "This group is not on Teamker yet, set up by completing the form below.";
        } else {
            let numOnTeamker = this.usersOnTeamker.length;
            let numOfAllMember = this.usersNotOnTeamker.length + numOnTeamker;
            return numOnTeamker + " of " + numOfAllMember + " group members have finished the questions.";
        }
    }

    getButtonContent(): string {
        if (this.isNewGroup) {
            return "Confirm";
        } else {
            return "Delete this group from Teamker";
        }
    }

    getButtonMessage(): string {
        if (this.isNewGroup) {
            return "Once questions set up, you cannnot modify then anymore.";
        } else {
            return "All user data will be deleted from Teamker.";
        }
    }

    onAddButtonClicked(): void {
        this.setState({
            numOfInputs: this.state.numOfInputs + 1
        });
    }

    onDeleteButtonClicked(): void {
        this.setState({
            numOfInputs: this.state.numOfInputs - 1
        });
    }

    onSwitchButtonClicked(): void {
        this.setState({
            matchMostSimilar: !this.state.matchMostSimilar
        });
    }

    onGroupListClicked(index: number) {
        if (!(this.isNewGroup && index == this.state.selectIndex)) {
            this.fetchGroupStatus(index);
            this.initialiseStatus = 0;
            this.setState({
                selectIndex: index
            });
        }
    }

    onUserListClicked(userDetailIndex: number): void {
        this.userDetailIndex = userDetailIndex;
        this.setState({
            shouldUserDetailsOpen: true
        });
    }

    closeUserDetails(): void {
        this.setState({
            shouldUserDetailsOpen: false
        });

        this.userDetailIndex = -1;
    }

    render() {
        let mainContent: JSX.Element = null;
        let groupList: JSX.Element[] = [];
        let inputs: JSX.Element[] = [];
        let userDetails: JSX.Element = null;
        let body: JSX.Element = null;

        for (let i = 0; i < this.props.groupList.length; i++) {
            let groupStyle = (i == this.state.selectIndex) ? "GroupSelected" : "Group";
            groupList.push(
                <div className={groupStyle} key={i} onClick={this.onGroupListClicked.bind(this, i)}>{this.props.groupList[i].name}</div>
            );
        }

        if (this.initialiseStatus <= 0) {
            console.log("initialise status: " + this.initialiseStatus);

            if (this.initialiseStatus < 0) {
                this.fetchGroupStatus(this.state.selectIndex);
            }

            body = (
                <LoaderPage message={"Wait for a moment..."} color={"#7B7B7B"} />
            );
        }

        if (this.initialiseStatus > 0 && this.isNewGroup) {
            for (let i = 0; i < this.state.numOfInputs; i++) {
                let addButton: JSX.Element = null;
                let deleteButton: JSX.Element = null;

                if (i == this.state.numOfInputs - 1) {
                    if (i < 19) {
                        addButton = (<div className={"AddButton"} onClick={this.onAddButtonClicked.bind(this)}>+</div>);
                    }

                    if (this.state.numOfInputs > 3) {
                        deleteButton = (<div className={"DeleteButton"} onClick={this.onDeleteButtonClicked.bind(this)}>-</div>);
                    }
                }

                inputs.push(
                    <form key={i}>
                        <div className={"Index"}>{i + 1}</div>
                        <input type="text" />
                        {addButton}
                        {deleteButton}
                    </form>
                );
            }

            mainContent = (
                <div className={"MainContent"}>
                    <div className={"PartA"}>
                        <div className={"Title"}>Set up question attributes</div>
                        <div className={"Explaination"}>You can set 3-20 question attributes here. Each question will be in the format “How much do you know about … ?”, and answer will be scores from 1 to 10.</div>
                        <div className={"AttributesInputs"}>{inputs}</div>
                    </div>
                    <div className={"PartB"}>
                        <div className={"Title"}>Set up matching options</div>
                        <div className={"MatchOption"}>
                            <div className={"MatchContent"}>Match members if they are</div>
                            <div className={"SwitchButton"} onClick={this.onSwitchButtonClicked.bind(this)}>
                                <div className={this.state.matchMostSimilar ? "OptionSelected" : "Option"}>most similar</div>
                                <div className={this.state.matchMostSimilar ? "Option" : "OptionSelected"}>most different</div>
                            </div>
                        </div>

                    </div>
                </div>
            );
        } else if (this.initialiseStatus > 0) {
            let userListA: JSX.Element[] = [];
            let userListB: JSX.Element[] = [];
            let i = 0;

            userListA = this.usersOnTeamker.map(user => {
                return (
                    <div className={"User"} key={i} onClick={this.onUserListClicked.bind(this, i++)}>
                        <img className={"Photo"} src={require("../resources/images/user.svg")} />
                        <div className={"Name"}>{user.name}</div>
                    </div>
                );
            });

            i = 0;
            userListB = this.usersNotOnTeamker.map(user => {
                return (
                    <div className={"User"} key={i++}>
                        <img className={"Photo"} src={require("../resources/images/user.svg")} />
                        <div className={"Name"}>{user.name}</div>
                    </div>
                );
            });

            mainContent = (
                <div className={"MainContent"}>
                    <div className={"PartA"}>
                        <div className={"Title"}>They have answered questions</div>
                        <div className={"UserList"}>{userListA}</div>
                    </div>
                    <div className={"PartB"}>
                        <div className={"Title"}>They haven't answered questions</div>
                        <div className={"UserList"}>{userListB}</div>
                    </div>
                </div>
            );
        }

        if (this.state.shouldUserDetailsOpen) {
            let user = this.usersOnTeamker[this.userDetailIndex];
            userDetails = <UserDetails user={user} onCloseButtonClicked={this.closeUserDetails.bind(this)} />
        }

        if (this.initialiseStatus > 0) {
            body = (
                <div className={"Body"}>
                    <div className={this.getMessageStyle()}>{this.getMessage()}</div>
                    {mainContent}
                    <div className={"BottomButton"}>
                        <div className={this.getButtonStyle()}>{this.getButtonContent()}</div>
                        <div className={"ButtonMessage"}>{this.getButtonMessage()}</div>
                    </div>
                </div>
            );
        }

        return (
            <div className={"AdminPage"}>
                <div className={"Header"}>Hi Colin, welcome to the admin page.</div>
                {userDetails}
                <div className={"Main"}>
                    <div className={"Left"}>
                        <div className={"GroupPanel"}>
                            <div className={"LeftTitle"}>My Groups</div>
                            <div className={"GroupList"}>{groupList}</div>
                        </div>
                    </div>
                    <div className={"Right"}>
                        {body}
                    </div>
                </div>
            </div>
        );
    }
}