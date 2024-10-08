using UnityEngine;
using UnityEngine.UI;

public class Healthbar : MonoBehaviour
{
    public int maxHealth;
    public Image healthFill;
    public void SetFill(float amount)
    {
        healthFill.fillAmount = amount / maxHealth;
    }
}
