#include <iostream>
using namespace std;

int main()
{
    int arr[8]={1,2,1,6,2,1,6,2}
    int count=0;
    for(int i=0;i<8;i++)
    {
        for(int j=i;j<8;j++)
        {
            if(arr[i]==arr[j])
                count++;
        }
        cout<<arr[i]<<" "<<count<<endl;
    }
}