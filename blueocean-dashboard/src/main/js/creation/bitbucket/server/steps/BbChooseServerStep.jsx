import React, { PropTypes } from 'react';
import { observer } from 'mobx-react';
import { Dropdown, FormElement } from '@jenkins-cd/design-language';

import FlowStep from '../../../flow2/FlowStep';
import BbAddServerDialog from '../BbAddServerDialog';


let t = null;


@observer
class BbChooseServerStep extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedServer: null,
            showAddServerDialog: false,
            urlErrorMsg: null,
        };

        this.dropdown = null;
    }

    componentWillMount() {
        t = this.props.flowManager.translate;
    }

    _onChangeServerDropdown(option) {
        const { serverManager } = this.props.flowManager;
        serverManager.validateVersion(option.id)
            .then(
                success => this._onValidateVersion(success),
                error => this._onValidateVersion(error),
            );
        this.setState({
            selectedServer: option,
        });
    }

    _onClickAddButton() {
        this.setState({
            showAddServerDialog: true,
        });
    }

    _onAddServerDialogClosed(newServer) {
        const newState = {
            showAddServerDialog: false,
        };

        if (newServer) {
            newState.selectedServer = newServer;
        }

        this.setState(newState);

        // TODO: control this more cleanly via a future 'selectedOption' prop on Dropdown
        this.dropdown.setState({
            selectedOption: newServer,
        });
    }

    _onClickNextButton() {
        this.props.flowManager.selectServer(this.state.selectedServer);
    }

    _onValidateVersion(error) {
        this.setState({
            urlErrorMsg: null,
        });
        if (error.code) {
            let message = error.message;
            if (!message) {
                message = t('creation.bbserver.version.error', { 0: error.code });
            }
            this.setState({
                urlErrorMsg: message,
            });
        }
    }

    render() {
        const { flowManager } = this.props;
        const { serverManager } = flowManager;
        const title = t('creation.bbserver.choose_server.title');
        const disabled = flowManager.stepsDisabled;
        const disabledNext = !this.state.selectedServer || this.state.urlErrorMsg;
        const url = this.state.selectedServer ? this.state.selectedServer.apiUrl : null;
        return (
            <FlowStep {...this.props} className="bitbucket-server-add-server-dialog" disabled={disabled} title={title}>
                <FormElement title={t('creation.bbserver.choose_server.instructions')}>
                    <Dropdown
                        ref={dropdown => { this.dropdown = dropdown; }}
                        className="dropdown-server"
                        options={serverManager.servers}
                        labelField="name"
                        onChange={option => this._onChangeServerDropdown(option)}
                    />
                    <button className="button-add-server btn-secondary" onClick={() => this._onClickAddButton()}>
                        {t('creation.bbserver.choose_server.button_add')}
                    </button>
                </FormElement>

                { this.state.showAddServerDialog &&
                <BbAddServerDialog
                    flowManager={flowManager}
                    onClose={cred => this._onAddServerDialogClosed(cred)}
                />
                }
                <div className="FormElement">
                    <div className="FormElement-heading">
                        <label className="FormElement-title creation-selected-server-url">{url}</label>
                    </div>
                </div>
                { this.state.urlErrorMsg &&
                    <div className="FormElement u-error-state" >
                        <div className="FormElement-heading">
                            <label className="FormElement-title">{this.state.urlErrorMsg}</label>
                        </div>
                    </div>
                }
                <button className="button-next-step" disabled={disabledNext} onClick={() => this._onClickNextButton()}>
                    {t('creation.githubent.choose_server.button_next')}
                </button>
            </FlowStep>
        );
    }
}

BbChooseServerStep.propTypes = {
    flowManager: PropTypes.object,
};

export default BbChooseServerStep;
