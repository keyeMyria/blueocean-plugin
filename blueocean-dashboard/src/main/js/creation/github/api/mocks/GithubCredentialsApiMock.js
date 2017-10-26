import { ApiMock } from './ApiMock';

import credentialFound from './credential-found';
import credentialMissing from './credential-missing';
import validateSuccess from './validate-success';
import validateInvalid from './validate-invalid';

/* eslint-disable no-unused-vars */

export class GithubCredentialsApi extends ApiMock {

    findExistingCredential() {
        if (this._hasUrlKey('credential=missing')) {
            return this._delayedResolve(credentialMissing);
        }

        return this._delayedResolve(credentialFound);
    }

    createAccessToken(accessToken) {
        if (this._hasUrlKey('validate=invalid') && accessToken !== 'peekaboo') {
            return this._delayedReject(validateInvalid);
        }

        return this._delayedResolve(validateSuccess);
    }

}
