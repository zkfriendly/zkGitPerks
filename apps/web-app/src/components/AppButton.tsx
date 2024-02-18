import { Button } from "@chakra-ui/react"
import IconAddCircleFill from "../icons/IconAddCircleFill"

const AppButton: typeof Button = (props) => (
    <Button
        w="100%"
        fontWeight="bold"
        justifyContent="left"
        colorScheme="primary"
        px="4"
        leftIcon={<IconAddCircleFill />}
        {...props}
    />
)

export default AppButton
