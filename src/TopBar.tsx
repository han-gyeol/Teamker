import * as React from 'react';

interface TopBarProps {
    appTitle: string
    userName: string
    userId: string 
    onLogout: Function 
}

interface TopBarStates { }

export default class TopBar extends React.Component<TopBarProps, TopBarStates> {
    // photolink: string = ("http://graph.facebook.com/" + this.props.userId + "/picture?type=square")
    render() {
        if (this.props.userId == ""){
            return (
                <div className={"TopBar"}>
                    <img className={"Logo"} src={require("../resources/icons/logo.png")} />
                    <div className={"Title"}>{this.props.appTitle}</div>
                </div>
            )
        }else{
            var photolink = ("http://graph.facebook.com/" + this.props.userId + "/picture?type=square")
            return (
                <div className={"TopBar"}>
                    <img className={"Logo"} src={require("../resources/icons/logo.png")} />
                    <div className={"Title"}>{this.props.appTitle}</div>
                    <img className={"ProfilePhoto"} src={photolink}/>
                    <div className={"UserName"}>{this.props.userName}</div>
                    <button className={"loginBtn loginBtn--facebook"} 
                            onClick={this.props.onLogout.bind(this)}>
                            Log out</button> 
                   
                    {/* Facebook user related here... */}
                </div>
            );
        }
        
    }
}