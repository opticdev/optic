import * as NodeGit from 'nodegit';
import { getPaths } from '../Paths';

class VersionControl {

    async getCurrentGitState() {
        const { cwd } = await getPaths()
        const repo = await NodeGit.Repository.open(cwd)
        const config = await repo.config()
        const email = await config.getStringBuf('user.email')
        const currentBranch = await repo.getCurrentBranch()
        const commit = await repo.getHeadCommit()
        
        return {
            email,
            branch: currentBranch.shorthand(),
            commitId: commit.sha()
        }
    }
}

export {
    VersionControl
}