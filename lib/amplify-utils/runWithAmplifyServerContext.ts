import { fetchUserAttributes } from "aws-amplify/auth/server"
import { createServerRunner } from "@aws-amplify/adapter-nextjs"
import config from '@/amplify_outputs.json'
import { cookies } from "next/headers"

const { runWithAmplifyServerContext } = createServerRunner(
    {
        config
    }
)

export const getFetchUserAttr = async () => {
    try{
        const currentUser = await runWithAmplifyServerContext({
            nextServerContext: { cookies: () => cookies() },
            operation: (contextSpec) => fetchUserAttributes(contextSpec)
        })
        return currentUser
    }
    catch(err){
        console.log(err)
        return false
    }
}