sbt project clean compile assembly
output='server/target/scala-2.12/server-assembly.jar'

echo $output

dest='cli/jvm/server-assembly.jar'

echo $dest

yes | cp -rf $output $dest